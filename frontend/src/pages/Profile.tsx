import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spine from '../components/Spine';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';

const CROP_SIZE = 220;
const EXPORT_SIZE = 400;

const formatDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

type NaturalSize = { w: number; h: number };
type Offset = { x: number; y: number };

const getCropGeometry = (zoom: number, natural: NaturalSize) => {
  const baseScale = Math.max(CROP_SIZE / natural.w, CROP_SIZE / natural.h);
  const scale = baseScale * zoom;
  const displayedWidth = natural.w * scale;
  const displayedHeight = natural.h * scale;
  const maxX = Math.max(0, (displayedWidth - CROP_SIZE) / 2);
  const maxY = Math.max(0, (displayedHeight - CROP_SIZE) / 2);
  return { displayedWidth, displayedHeight, maxX, maxY };
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<NaturalSize | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ pointerX: 0, pointerY: 0, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    if (!previewSrc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewSrc]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingFile(file);
      setPreviewSrc(reader.result as string);
      setNaturalSize(null);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const closePreview = () => {
    setPendingFile(null);
    setPreviewSrc(null);
    setNaturalSize(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  };

  const handleZoomChange = (nextZoom: number) => {
    if (!naturalSize) {
      setZoom(nextZoom);
      return;
    }
    const geo = getCropGeometry(nextZoom, naturalSize);
    setOffset((prev) => ({
      x: clamp(prev.x, -geo.maxX, geo.maxX),
      y: clamp(prev.y, -geo.maxY, geo.maxY)
    }));
    setZoom(nextZoom);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!naturalSize) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStart.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !naturalSize) return;
    const geo = getCropGeometry(zoom, naturalSize);
    const deltaX = e.clientX - dragStart.current.pointerX;
    const deltaY = e.clientY - dragStart.current.pointerY;
    setOffset({
      x: clamp(dragStart.current.offsetX + deltaX, -geo.maxX, geo.maxX),
      y: clamp(dragStart.current.offsetY + deltaY, -geo.maxY, geo.maxY)
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  const exportCroppedImage = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = imgRef.current;
      if (!img || !naturalSize) return resolve(null);
      const canvas = document.createElement('canvas');
      canvas.width = EXPORT_SIZE;
      canvas.height = EXPORT_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      const geo = getCropGeometry(zoom, naturalSize);
      const exportScale = EXPORT_SIZE / CROP_SIZE;
      const drawWidth = geo.displayedWidth * exportScale;
      const drawHeight = geo.displayedHeight * exportScale;
      const drawX = EXPORT_SIZE / 2 - drawWidth / 2 + offset.x * exportScale;
      const drawY = EXPORT_SIZE / 2 - drawHeight / 2 + offset.y * exportScale;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
    });
  };

  const confirmAvatarUpload = async () => {
    if (!pendingFile) return;
    setError('');
    setIsUploading(true);
    try {
      const blob = await exportCroppedImage();
      if (!blob) {
        setError('Could not process the image. Try a different photo.');
        return;
      }
      const croppedFile = new File([blob], pendingFile.name, { type: 'image/jpeg' });
      const updated = await authApi.uploadAvatar(croppedFile);
      updateUser(updated);
      closePreview();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not upload photo. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      const updated = await authApi.updateProfile({ name, bio });
      updateUser(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name);
    setBio(user.bio ?? '');
    setIsEditing(false);
    setError('');
  };

  const geo = naturalSize ? getCropGeometry(zoom, naturalSize) : null;

  return (
    <div className="flex stack:flex-col min-h-screen bg-canvas">
      <Spine />
      <main className="flex-1 min-w-0">
        <div className="border-b border-canvas-line px-14 stack:px-5 pt-11 stack:pt-6 pb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-body-muted mb-2">
                fol. 01 — account
              </div>
              <h1 className="font-display text-[40px] stack:text-[30px] leading-none text-ink">Profile</h1>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-body-muted border border-canvas-line rounded-card px-4 py-2 hover:text-ink hover:border-ink transition-colors duration-150"
              >
                Edit profile
              </button>
            )}
          </div>
        </div>

        <div className="px-14 stack:px-5 py-11 stack:py-6 grid grid-cols-[1fr_320px] stack:grid-cols-1 gap-16 stack:gap-10 max-w-[1200px]">
          <section>
            <div className="flex items-center gap-7 mb-10 flex-wrap">
              <div className="relative group cursor-pointer shrink-0" onClick={openFilePicker}>
                <Avatar name={user.name} avatarUrl={user.avatar_url} size={112} />
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-ink/0 group-hover:bg-ink/45 transition-colors duration-200">
                  <span className="opacity-0 group-hover:opacity-100 text-paper text-[10px] font-mono uppercase tracking-[0.1em] transition-opacity duration-200">
                    change
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {!isEditing ? (
                <div>
                  <div className="font-display text-[26px] text-ink leading-tight">{user.name}</div>
                  <div className="font-mono text-[13px] text-body-muted mt-1">{user.email}</div>
                </div>
              ) : (
                <div className="flex-1 min-w-[220px] max-w-[360px]">
                  <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-body-muted block mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-b border-canvas-line bg-transparent font-display text-[22px] text-ink pb-1.5 focus:outline-none focus:border-ink transition-colors"
                  />
                </div>
              )}
            </div>

            {error && !previewSrc && (
              <div className="bg-danger-soft text-danger text-[13px] px-3.5 py-2.5 rounded-card mb-7 max-w-[520px]">
                {error}
              </div>
            )}

            <div className="max-w-[560px]">
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-body-muted mb-2.5">
                Bio
              </div>
              {!isEditing ? (
                user.bio ? (
                  <p className="font-display italic text-[19px] leading-relaxed text-ink border-l-2 border-canvas-line pl-5">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-body-muted text-sm italic">Nothing written in the margin yet.</p>
                )
              ) : (
                <>
                  <textarea
                    rows={4}
                    maxLength={280}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="A line or two about yourself"
                    className="w-full border border-canvas-line bg-paper rounded-card px-4 py-3 text-[15px] text-ink resize-none focus:outline-none focus:border-ink transition-colors"
                  />
                  <div className="text-[11px] text-body-muted font-mono text-right mt-1">{bio.length}/280</div>
                </>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-7">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="font-body font-semibold text-sm rounded-card bg-ink text-paper px-5 py-2.5 hover:enabled:bg-ink-soft disabled:opacity-60 transition-colors duration-150"
                >
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="font-body font-semibold text-sm rounded-card border border-canvas-line text-ink px-5 py-2.5 hover:bg-canvas-line transition-colors duration-150"
                >
                  Cancel
                </button>
              </div>
            )}
          </section>

          <aside>
            <div className="bg-paper border border-canvas-line rounded-card p-6 mb-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-body-muted mb-4">
                Colophon
              </div>
              <div className="flex justify-between items-baseline py-2.5 border-b border-canvas-line">
                <span className="text-[12px] text-body-muted">email</span>
                <span className="text-[13px] text-ink text-right">{user.email}</span>
              </div>
              <div className="flex justify-between items-baseline py-2.5">
                <span className="text-[12px] text-body-muted">member since</span>
                <span className="text-[13px] text-ink text-right">{formatDate(user.created_at)}</span>
              </div>
            </div>

            <div className="border border-canvas-line rounded-card p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-body-muted mb-3">
                Session
              </div>
              <p className="text-[13px] text-body-muted mb-4 leading-relaxed">
                Sign out of this account on this device.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full font-body font-semibold text-sm rounded-card bg-danger-soft text-danger px-4 py-2.5 hover:bg-danger-hover transition-colors duration-150"
              >
                Log out
              </button>
            </div>
          </aside>
        </div>
      </main>

      {previewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-5"
          onClick={closePreview}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="bg-paper rounded-card border border-canvas-line p-8 w-full max-w-[360px] text-center"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-body-muted mb-1">
              New photo
            </div>
            <p className="text-[11px] text-body-muted mb-5">Drag to reposition, use the slider to zoom</p>

            <div
              className="relative w-[220px] h-[220px] rounded-full overflow-hidden border border-canvas-line mx-auto mb-5 touch-none select-none cursor-grab active:cursor-grabbing bg-canvas"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <img
                ref={imgRef}
                src={previewSrc}
                onLoad={handleImageLoad}
                draggable={false}
                alt="Selected avatar preview"
                style={
                  geo
                    ? {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: geo.displayedWidth,
                        height: geo.displayedHeight,
                        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`
                      }
                    : { opacity: 0 }
                }
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => handleZoomChange(Number(e.target.value))}
              className="w-full mb-6 accent-ink"
            />

            {error && (
              <div className="bg-danger-soft text-danger text-[13px] px-3 py-2.5 rounded-card mb-5">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={confirmAvatarUpload}
                disabled={isUploading}
                className="flex-1 font-body font-semibold text-sm rounded-card bg-ink text-paper px-4 py-2.5 hover:enabled:bg-ink-soft disabled:opacity-60 transition-colors duration-150"
              >
                {isUploading ? 'Uploading…' : 'Set as photo'}
              </button>
              <button
                type="button"
                onClick={closePreview}
                disabled={isUploading}
                className="flex-1 font-body font-semibold text-sm rounded-card border border-canvas-line text-ink px-4 py-2.5 hover:bg-canvas-line transition-colors duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;