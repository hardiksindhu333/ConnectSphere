import { useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import API from "../../api/axios.js";

const UploadVideo = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient(); // IMPORTANT

  const videoPreviewUrl = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : null),
    [videoFile]
  );
  const thumbPreviewUrl = useMemo(
    () => (thumbnail ? URL.createObjectURL(thumbnail) : null),
    [thumbnail]
  );

  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const onVideoSelect = (file) => {
    setVideoFile(file || null);
  };

  const onThumbSelect = (file) => {
    setThumbnail(file || null);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!videoFile || !thumbnail) {
    return toast.error("Please upload video & thumbnail");
  }

  try {
    setIsUploading(true);
    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("videoFile", videoFile);
    formData.append("thumbnail", thumbnail);

    await API.post("/videos/publish", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Video uploaded");

    // CORRECT INVALIDATION
    await queryClient.invalidateQueries({ queryKey: ["videos"] });
    await queryClient.invalidateQueries({ queryKey: ["feed"] });

    navigate("/");

  } catch (err) {
    console.log(err);
    toast.error(err.response?.data?.message || "Upload failed");
  } finally {
    setIsUploading(false);
  }
};

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold">Upload</h1>
        <p className="text-sm text-gray-400 mt-1">
          Add a title, description, video file and thumbnail.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="font-semibold">Details</div>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-3 rounded-xl bg-black border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
              />

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={6}
                className="w-full p-3 rounded-xl bg-black border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
              />

              <div>
                <div className="text-sm text-gray-300 font-medium mb-2">Video file</div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f && f.type.startsWith("video/")) onVideoSelect(f);
                  }}
                  className="rounded-xl p-4 border-2 border-dashed border-white/10 bg-black/5 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-sm text-gray-300">Drag & drop a video, or</div>
                    <div className="text-xs text-gray-400 mt-1">
                      MP4, MOV, WEBM — max file size depends on server
                    </div>
                    {videoFile ? (
                      <div className="text-xs text-gray-400 mt-2 truncate">
                        {videoFile.name} • {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => onVideoSelect(e.target.files?.[0] || null)}
                    />
                    {videoFile ? (
                      <>
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => onVideoSelect(null)}
                          className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm text-white"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 text-sm"
                      >
                        Choose file
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-300 font-medium mb-2">Thumbnail</div>

                <div className="flex items-start gap-4">
                  <div className="w-32 h-20 rounded-xl bg-white/10 overflow-hidden border border-white/10">
                    {thumbPreviewUrl ? (
                      <img src={thumbPreviewUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onThumbSelect(e.target.files?.[0] || null)}
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => thumbInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 text-sm"
                      >
                        {thumbnail ? "Change" : "Choose image"}
                      </button>
                      {thumbnail ? (
                        <button
                          type="button"
                          onClick={() => onThumbSelect(null)}
                          className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm text-white"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>

                    <div className="text-xs text-gray-400 mt-2">
                      Recommended: 1280x720, JPG/PNG
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="mt-2 w-full px-4 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 disabled:opacity-60"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="font-semibold">Preview</div>
            <div className="mt-4 space-y-4">
              <div className="aspect-video rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
                {videoPreviewUrl ? (
                  <video src={videoPreviewUrl} controls className="w-full h-full" />
                ) : (
                  <div className="text-gray-500 text-sm">Select a video to preview</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-300 font-medium mb-2">Thumbnail preview</div>
                  <div className="aspect-video rounded-xl bg-white/10 border border-white/10 overflow-hidden">
                    {thumbPreviewUrl ? (
                      <img src={thumbPreviewUrl} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-300 font-medium mb-2">Title</div>
                  <div className="text-sm text-gray-200 line-clamp-3">
                    {form.title || "—"}
                  </div>
                  <div className="text-sm text-gray-300 font-medium mb-2 mt-4">Description</div>
                  <div className="text-xs text-gray-400 line-clamp-6 whitespace-pre-wrap">
                    {form.description || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;