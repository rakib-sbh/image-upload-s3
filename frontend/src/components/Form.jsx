import { useRef, useState } from "react";
import { API } from "../config/api";

const Form = () => {
  const imageRef = useRef();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("image", imageRef.current.files[0]);

    const response = await API.post("/upload", formData);
    if (response.status === 200) {
      setPreviewUrl(response.data.imageUrl);
    }
  };

  const handleChange = (e) => {
    if (imageRef.current) {
      setFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
        <p>
          <button type="submit">Upload File</button>
        </p>
      </form>
      <div>
        <p>Preview Image</p>
        {previewUrl && <img src={previewUrl} alt="Preview Image" />}
      </div>
    </div>
  );
};

export default Form;
