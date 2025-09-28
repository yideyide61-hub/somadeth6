export default function Home() {
  return (
    <div>
      <h1>Upload Customer</h1>
      <form id="uploadForm" method="POST" encType="multipart/form-data" action="/api/upload">
        <input type="text" name="title" placeholder="Enter title" required /><br /><br />
        <input type="file" name="file" /><br /><br />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}
