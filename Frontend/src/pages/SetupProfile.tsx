import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ImagePlus, CheckCircle, X, ArrowLeft, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function SetupProfile() {
  const { currentUser, saveArtisanProfile, artisanProfile } = useAppContext();
  const navigate = useNavigate();

  // Redirect non-sellers away
  if (!currentUser || currentUser.userType !== 'seller') {
    navigate('/auth');
    return null;
  }

  const [profileImage, setProfileImage] = useState<string>(artisanProfile?.profileImage || '');
  const [description, setDescription] = useState(artisanProfile?.description || '');
  const [errors, setErrors] = useState<{ image?: string; description?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => setProfileImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: { image?: string; description?: string } = {};
    if (!profileImage) e.image = 'Please upload a profile photo.';
    if (!description.trim()) e.description = 'Please write a short description about yourself.';
    else if (description.trim().length < 20) e.description = 'Description must be at least 20 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    // Simulate brief async (localStorage is sync but UX feels better)
    await new Promise(r => setTimeout(r, 600));
    saveArtisanProfile(profileImage, description.trim());
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate('/seller-dashboard'), 1200);
  };

  const descLen = description.trim().length;
  const descValid = descLen >= 20;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--cream-bg)' }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/seller-dashboard')}
        className="fixed top-6 left-6 flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-white shadow hover:shadow-md transition-shadow"
        style={{ color: 'var(--dark-brown)' }}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="w-full max-w-xl">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header banner */}
          <div
            className="px-8 py-8 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--dark-brown) 0%, #5C3A1E 100%)' }}
          >
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white opacity-10" />
            <div className="absolute top-4 right-20 w-16 h-16 rounded-full bg-white opacity-10" />
            <h1 className="text-2xl text-white mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
              Set Up Your Profile
            </h1>
            <p className="text-white/70 text-sm">
              Tell buyers your story — appear on the <strong>Meet Our Artisans</strong> page once you save.
            </p>
          </div>

          <div className="px-8 py-8 space-y-8">
            {/* ── Profile Photo ── */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--dark-brown)' }}>
                Profile Photo <span style={{ color: 'var(--rust-red)' }}>*</span>
              </label>

              {/* Hidden gallery input */}
              <input
                ref={galleryInputRef}
                type="file" accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && readFile(e.target.files[0])}
              />

              <div className="flex items-start gap-6">
                {/* Preview circle */}
                <div className="relative shrink-0">
                  <div
                    className="w-28 h-28 rounded-full overflow-hidden border-4 flex items-center justify-center"
                    style={{ borderColor: profileImage ? 'var(--sage-green)' : '#e5e7eb', backgroundColor: '#f9fafb' }}
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-300" />
                    )}
                  </div>
                  {profileImage && (
                    <button
                      onClick={() => setProfileImage('')}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Upload buttons */}
                <div className="flex flex-col gap-3 flex-1">
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm border-2 hover:opacity-80 transition-opacity"
                    style={{ borderColor: 'var(--sage-green)', color: 'var(--sage-green)', backgroundColor: '#F0FFF4' }}
                  >
                    <ImagePlus className="w-4 h-4" />
                    Add from Gallery
                  </button>
                  <p className="text-xs text-gray-400">JPG, PNG — max 5 MB. Use a clear face photo.</p>
                </div>
              </div>

              {errors.image && (
                <p className="mt-2 text-sm" style={{ color: 'var(--rust-red)' }}>{errors.image}</p>
              )}
            </div>

            {/* ── Description ── */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--dark-brown)' }}>
                About You <span style={{ color: 'var(--rust-red)' }}>*</span>
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Describe your craft, style, and expertise. This appears on the Artisans page.
              </p>
              <textarea
                className="w-full px-4 py-3 rounded-xl border-2 resize-none focus:outline-none transition-colors text-sm"
                style={{
                  borderColor: errors.description ? 'var(--rust-red)' : descValid ? 'var(--sage-green)' : '#e5e7eb',
                  minHeight: 130,
                }}
                placeholder="e.g. I am a third-generation Banarasi weaver from Varanasi, crafting silk sarees using traditional handloom techniques that have been in my family for over 80 years…"
                value={description}
                onChange={e => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: undefined })); }}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.description ? (
                  <p className="text-sm" style={{ color: 'var(--rust-red)' }}>{errors.description}</p>
                ) : descValid ? (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Looks great!
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">{Math.max(0, 20 - descLen)} more characters needed</p>
                )}
                <span className="text-xs text-gray-400">{descLen} / 500</span>
              </div>
            </div>

            {/* ── Save button ── */}
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-3"
              style={{
                backgroundColor: saved ? '#22c55e' : 'var(--sage-green)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              }}
            >
              {saved ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Profile Saved! Redirecting…
                </>
              ) : saving ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Profile'
              )}
            </button>

            <p className="text-xs text-center text-gray-400">
              You can update your profile anytime from the dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
