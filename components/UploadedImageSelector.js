import React, { useEffect, useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import toast from 'react-hot-toast';
import styles from '@styles/UploadedImageSelector.module.css';

export default function UploadedImageSelector({ postRef }) {
  const imagesCollection = postRef.collection('images');
  const [images] = useCollectionData(imagesCollection);

  const [coverImageSrc, setCoverImageSrc] = useState(null);

  useEffect(() => {
    if (images && images.length > 0) {
      setCoverImageSrc(images[0].src);
    }
  }, [images]);

  useEffect(() => {
    if (coverImageSrc) {
      // Update the cover image on the post ref
      postRef.update({
        coverImage: coverImageSrc,
      });
    }
  }, [coverImageSrc]);

  // Grab the post slug as the alt text
  const imageAlt = postRef?.path?.split('/')[3];

  return (
    <div className={styles.container}>
      <h3>Images:</h3>
      <p>Click on an image to copy the embed code to add to your post.</p>
      {images &&
        images.map((image, idx) => {
          return image.src ? (
            <div key={idx} className={styles.thumbnail}>
              <ImageThumbnail image={image} imageAlt={imageAlt} />
            </div>
          ) : null;
        })}
    </div>
  );
}

function ImageThumbnail(props) {
  const { image, imageAlt } = props;
  return (
    <img
      src={image.src}
      alt={imageAlt}
      onClick={() => {
        navigator.clipboard.writeText(`![${imageAlt}](${image.src})`);
        toast.success('Copied to clipboard!');
      }}
    />
  );
}
