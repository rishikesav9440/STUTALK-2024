import styles from '@styles/Admin.module.css';
import AuthCheck from '@components/AuthCheck';
import { firestore, auth, serverTimestamp } from '@lib/firebase';
import ImageUploader from '@components/ImageUploader';
import UploadedImageSelector from '@components/UploadedImageSelector';

import { useState } from 'react';
import { useRouter } from 'next/router';

import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminPostEdit(props) {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

function PostManager() {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const postRef = firestore.collection('users').doc(auth.currentUser.uid).collection('posts').doc(slug);
  const [post] = useDocumentDataOnce(postRef);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm postRef={postRef} defaultValues={post} preview={preview} />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
            <ImageUploader postRef={postRef} />
            <UploadedImageSelector postRef={postRef} />
            <DeletePostButton postRef={postRef} />
          </aside>
        </>
      )}
    </main>
  );
}

function PostForm({ defaultValues, postRef, preview }) {
  const { register, errors, handleSubmit, formState, reset, watch } = useForm({ defaultValues, mode: 'onChange' });

  const { isValid, isDirty } = formState;

  const updatePost = async ({ content, imageurl, published }) => {
    await postRef.update({
      content,
      imageurl,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, imageurl, published });

    toast.success('Post updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          {/* Displaying the imageurl in the preview above content */}
          <ReactMarkdown>{watch('imageurl')}</ReactMarkdown>
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>

        {/* Content 2 */}
        <textarea
          name="imageurl"
          ref={register({
            maxLength: { value: 20000, message: 'Upload The Image' },
            minLength: { value: 10, message: 'Upload The Image' },
            required: { value: true, message: 'Upload The Image' },
          })}
          rows={5} 
          style={{ marginBottom: '10px' , height: "auto" }} // Adding some bottom margin for spacing
        ></textarea>

        {errors.imageurl && <p className="text-danger">{errors.imageurl.message}</p>}

        {/* Content 1 */}
        <textarea
          name="content"
          ref={register({
            maxLength: { value: 20000, message: 'Content is too long' },
            minLength: { value: 10, message: 'Content is too short' },
            required: { value: true, message: 'Content is required' },
          })}
        ></textarea>

        {errors.content && <p className="text-danger">{errors.content.message}</p>}

        <fieldset>
          <input className={styles.checkbox} name="published" type="checkbox" ref={register} />
          <label>Published</label>
        </fieldset>

        <button type="submit" className="btn-green" disabled={!isDirty || !isValid}>
          Save Changes
        </button>
      </div>
    </form>
  );
}




function DeletePostButton({ postRef }) {
  const router = useRouter();

  const deletePost = async () => {
    const doIt = confirm('are you sure!');
    if (doIt) {
      await postRef.delete();
      router.push('/admin');
      toast('post annihilated ', { icon: '🗑️' });
    }
  };

  return (
    <button className="btn-red" onClick={deletePost}>
      Delete
    </button>
  );
}
