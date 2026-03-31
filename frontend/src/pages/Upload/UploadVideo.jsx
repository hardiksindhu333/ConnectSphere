import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const UploadVideo = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient(); // 🔥 IMPORTANT

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!videoFile || !thumbnail) {
    return toast.error("Please upload video & thumbnail");
  }

  try {
    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("videoFile", videoFile);
    formData.append("thumbnail", thumbnail);

    await axios.post(
      "http://localhost:3000/api/v1/videos/publish",
      formData,
      {
        withCredentials: true,
      }
    );

    toast.success("Video uploaded 🚀");

    // ✅ CORRECT INVALIDATION
    await queryClient.invalidateQueries({ queryKey: ["videos"] });

    navigate("/");

  } catch (err) {
    console.log(err);
    toast.error(err.response?.data?.message || "Upload failed");
  }
};

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-2xl font-bold mb-6">
        Upload Video
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">

        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          className="w-full p-3 rounded bg-white/10"
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full p-3 rounded bg-white/10"
        />

        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnail(e.target.files[0])}
        />

        <button
          type="submit"
          className="bg-white text-black px-4 py-2 rounded"
        >
          Upload
        </button>

      </form>

    </div>
  );
};

export default UploadVideo;