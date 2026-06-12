import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".csv")) {
        setFile(file);
        setErrorMessage("");
        setSuccessMessage("");
      } else {
        setErrorMessage("Please select a CSV file");
        setFile(undefined);
      }
    }
  };

  const removeFile = () => {
    setFile(undefined);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const uploadFile = async () => {
    if (!file) {
      setErrorMessage("No file selected");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      console.log("Getting signed URL for file: ", file.name);

      // Step 1: Get the presigned URL from the import service
      const authorizationToken = localStorage.getItem("authorization_token");
      const signedUrlResponse = await fetch(
        `${url}/import?name=${encodeURIComponent(file.name)}`,
        {
          headers: authorizationToken
            ? {
                Authorization: `Basic ${authorizationToken}`,
              }
            : undefined,
        }
      );

      if (!signedUrlResponse.ok) {
        const errorBody = await signedUrlResponse.text();
        throw new Error(
          `Failed to get signed URL: ${signedUrlResponse.status} ${
            signedUrlResponse.statusText
          }${errorBody ? ` - ${errorBody}` : ""}`
        );
      }

      const signedUrl = await signedUrlResponse.text();
      console.log("Received signed URL, uploading file...");

      // Step 2: Upload the file to S3 using the signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": "text/csv",
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`File upload failed: ${uploadResponse.statusText}`);
      }

      console.log("File uploaded successfully!");
      setSuccessMessage(
        `File "${file.name}" uploaded successfully! The system is processing it.`
      );
      setFile(undefined);

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Upload error: ", errorMsg);
      setErrorMessage(`Upload failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {!file ? (
        <input
          type="file"
          accept=".csv"
          onChange={onFileChange}
          disabled={loading}
        />
      ) : (
        <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center" }}>
          <Typography variant="body2">
            Selected file: <strong>{file.name}</strong>
          </Typography>
          <button onClick={removeFile} disabled={loading}>
            Remove file
          </button>
          <button onClick={uploadFile} disabled={loading}>
            {loading ? "Uploading..." : "Upload file"}
          </button>
          {loading && <CircularProgress size={24} />}
        </Box>
      )}
    </Box>
  );
}
