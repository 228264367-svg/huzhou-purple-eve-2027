const space = "https://fashn-ai-fashn-vton-1-5.hf.space";
const api = space + "/gradio_api";
async function checked(response) {
  if (!response.ok)
    throw new Error(
      response.status === 429
        ? "试穿服务今天较忙，请稍后再试。"
        : `试穿服务返回 ${response.status}，请稍后再试。`,
    );
  return response;
}
export async function preparePhoto(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("请选择 JPG、PNG 或 WebP 照片。");
  if (file.size > 15 * 1024 * 1024)
    throw new Error("请选择小于 15 MB 的照片。");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(
      1,
      1280 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("照片处理失败，请换一张试试。")),
        "image/jpeg",
        0.9,
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
async function awaitResult(id, signal) {
  const response = await checked(
    await fetch(`${api}/call/try_on/${encodeURIComponent(id)}`, {
      signal,
      credentials: "omit",
    }),
  );
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let remaining = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      remaining += decoder.decode(value, { stream: !done });
      let boundary;
      while ((boundary = /\r?\n\r?\n/.exec(remaining))) {
        const block = remaining.slice(0, boundary.index);
        remaining = remaining.slice(boundary.index + boundary[0].length);
        const event = block.match(/^event:\s*(\S+)/m)?.[1];
        if (event === "error")
          throw new Error("公共试穿服务未完成本次生成，可稍后再试。");
        if (event === "complete") {
          const data = JSON.parse(block.match(/^data: *(.*)/m)?.[1] || "null");
          const url = new URL(data?.[0]?.url);
          if (
            url.origin !== space ||
            !url.pathname.startsWith("/gradio_api/file=")
          )
            throw new Error("试穿服务未返回有效图片。");
          return url.href;
        }
      }
      if (done) break;
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  throw new Error("与试穿服务的连接中断了，请稍后再试。");
}
export async function generateFit(inputs, category, kind, signal, update) {
  const form = new FormData();
  for (const [index, item] of inputs.entries()) {
    const blob =
      item.blob ||
      (await (await checked(await fetch(item.url, { signal }))).blob());
    form.append(
      "files",
      blob,
      `${index ? "garment" : "person"}.${blob.type === "image/jpeg" ? "jpg" : "webp"}`,
    );
  }
  const response = await checked(
    await fetch(api + "/upload", {
      method: "POST",
      body: form,
      signal,
      credentials: "omit",
    }),
  );
  const paths = await response.json();
  if (!Array.isArray(paths) || paths.length !== 2)
    throw new Error("试穿服务没有收到两张图片。");
  update("照片已送达，正在排队生成…");
  const data = [
    ...paths.map((path) => ({ path, meta: { _type: "gradio.FileData" } })),
    category,
    kind,
    40,
    1.5,
    42,
    true,
  ];
  const submit = await checked(
    await fetch(api + "/call/try_on", {
      method: "POST",
      body: JSON.stringify({ data }),
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      signal,
    }),
  );
  const { event_id } = await submit.json();
  if (!event_id) throw new Error("试穿服务未接受本次请求。");
  const url = await awaitResult(event_id, signal);
  const image = await checked(
    await fetch(url, { signal, credentials: "omit" }),
  );
  const output = await image.blob();
  if (!output.type.startsWith("image/")) throw new Error("结果图片读取失败。");
  return output;
}
