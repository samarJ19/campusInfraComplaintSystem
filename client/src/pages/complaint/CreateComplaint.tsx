import { useState } from "react";
import { type CreateComplaintRequest } from "../../types/complaint";
import { ComplaintService } from "../../services/complaint.service";
import { useCreateComplaint } from "../../hooks/useCreateComplaint";

export default function CreateComplaintPage() {
  const mutation = useCreateComplaint();

  const [loadingImage, setLoadingImage] = useState(false);

  const [form, setForm] = useState<CreateComplaintRequest>({
    title: "",
    description: "",
    category: "GENERAL",
    priority: "MEDIUM",
    imageUrl: "",
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setLoadingImage(true);

    try {
      console.log("Uploading image:", file);
      const imageUrl = await ComplaintService.uploadImage(file);
      console.log("Image uploaded successfully:", imageUrl);
      setForm({
        ...form,

        imageUrl,
      });
    } finally {
      setLoadingImage(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    mutation.mutate(form);
  }

  return (
    <div>
      <h1>Create Complaint</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />

        <br />
        <br />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <br />
        <br />

        <select name="category" value={form.category} onChange={handleChange}>
          {[
            "ELECTRICAL",

            "WATER",

            "SANITIZATION",

            "INTERNET",

            "INFRASTRUCTURE",

            "GENERAL",
          ].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <br />
        <br />

        <select name="priority" value={form.priority} onChange={handleChange}>
          <option>LOW</option>

          <option>MEDIUM</option>

          <option>HIGH</option>
        </select>

        <br />
        <br />

        <input type="file" accept="image/*" onChange={handleImageUpload} />

        {loadingImage && <p>Uploading...</p>}

        {form.imageUrl && <img src={form.imageUrl} width={200} />}

        <br />
        <br />

        <button disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create Complaint"}
        </button>
      </form>
    </div>
  );
}
