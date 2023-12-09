import { useEffect, useState } from 'react';
import { auth, storage, STATE_CHANGED } from '@lib/firebase';
import Loader from './Loader';

// Uploads images to Firebase Storage
export default function ImageUploader({ postRef }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState(null);

    // When an image has been uploaded, store the URL
  // against the post document in Firestore
  useEffect(() => {
    if (downloadURL) {
      postRef.collection('images').add({ src: downloadURL });
      // Reset the upload state
      setDownloadURL(null);
    }
  }, [downloadURL]);

  // Creates a Firebase Upload Task
  const uploadFile = async (e) => {
    // Get the file
    const file = Array.from(e.target.files)[0];
    const extension = file.type.split('/')[1];

    // Makes reference to the storage bucket location
    const ref = storage.ref(`uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`);
    setUploading(true);

    // Starts the upload
    const task = ref.put(file);

    // Listen to updates to upload task
    task.on(STATE_CHANGED, (snapshot) => {
      const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
      setProgress(pct);
    });

    // Get downloadURL AFTER task resolves (Note: this is not a native Promise)
    task
      .then((d) => ref.getDownloadURL())
      .then((url) => {
        setDownloadURL(url);
        setUploading(false);
      });
  };

  return (
    <div className='btn'>
      <Loader show={uploading} />
      {uploading && <h3>{progress}%</h3>}

      {!uploading && (
        <>
          <label>
            📸 Upload Img
            <input type='file' onChange={uploadFile} accept='image/x-png,image/gif,image/jpeg' />
          </label>
        </>
      )}
    </div>
  );
}
