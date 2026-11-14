import { useState, useRef } from 'react'
import { Upload, Trash2, Check } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import Modal from './Modal'
import UserAvatar from './UserAvatar'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'

const ICON_OPTIONS = [
  'User', 'Cat', 'Dog', 'Bird', 'Fish', 'Bug',
  'Ghost', 'Bot', 'Skull', 'Crown', 'Star', 'Heart',
  'Flame', 'Zap', 'Shield', 'Sword', 'Gamepad2', 'Code',
  'Rocket', 'Music', 'Palette', 'Camera', 'Diamond', 'Leaf',
]

const COLOR_OPTIONS = [
  '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4',
  '#14b8a6', '#22c55e', '#eab308', '#f97316', '#ef4444',
  '#ec4899', '#f43f5e', '#64748b', '#ffffff',
]

interface ProfileEditorProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  currentData: {
    avatarIcon: string
    avatarColor: string
    avatarImage?: string | null
  }
}

export default function ProfileEditor({ open, onClose, onSaved, currentData }: ProfileEditorProps) {
  const [tab, setTab] = useState<'icon' | 'photo'>('icon')
  const [avatarIcon, setAvatarIcon] = useState(currentData.avatarIcon)
  const [avatarColor, setAvatarColor] = useState(currentData.avatarColor)
  const [avatarImage, setAvatarImage] = useState(currentData.avatarImage)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const { data } = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAvatarImage(data.avatarImage)
      useAuthStore.getState().refreshUser()
    } catch {
      // ignore
    }
    setUploading(false)
  }

  const handleDeletePhoto = async () => {
    try {
      await api.delete('/profile/avatar')
      setAvatarImage(null)
      useAuthStore.getState().refreshUser()
    } catch {
      // ignore
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/profile', {
        avatarIcon,
        avatarColor,
      })
      useAuthStore.getState().refreshUser()
      onSaved()
      onClose()
    } catch {
      // ignore
    }
    setSaving(false)
  }

  return (
    <Modal open={open} onClose={onClose} title="Изменить аватар" maxWidth="max-w-md">
      <div className="space-y-5">
        {/* Tab switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('icon')}
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'icon' ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-gray-400'}`}
          >
            Иконка
          </button>
          <button
            onClick={() => setTab('photo')}
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'photo' ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-gray-400'}`}
          >
            Фото
          </button>
        </div>

        {tab === 'icon' ? (
          <div className="space-y-3">
            {/* Icon preview */}
            <div className="flex items-center gap-4">
              <UserAvatar avatarIcon={avatarIcon} avatarColor={avatarColor} size={64} />
              <div className="text-sm text-gray-400">Выберите иконку и цвет</div>
            </div>

            {/* Icon grid */}
            <div className="grid grid-cols-8 gap-1.5">
              {ICON_OPTIONS.map((icon) => {
                const Icon = (LucideIcons as any)[icon] || LucideIcons.User
                return (
                  <button
                    key={icon}
                    onClick={() => setAvatarIcon(icon)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      avatarIcon === icon
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                        : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                )
              })}
            </div>

            {/* Color grid */}
            <div className="flex gap-1.5 flex-wrap">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    avatarColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Photo preview */}
            <div className="flex items-center gap-4">
              <UserAvatar avatarImage={avatarImage} avatarIcon={avatarIcon} avatarColor={avatarColor} size={64} />
              <div className="flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm transition-colors disabled:opacity-50"
                >
                  <Upload size={14} />
                  {uploading ? 'Загрузка...' : 'Загрузить'}
                </button>
                {avatarImage && (
                  <button
                    onClick={handleDeletePhoto}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm transition-colors"
                  >
                    <Trash2 size={14} />
                    Удалить
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleUploadPhoto}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500">JPG, PNG, WebP. Макс 2MB.</p>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Check size={16} />
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </Modal>
  )
}
