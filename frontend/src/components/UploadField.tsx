import { useRef } from 'react'

interface Props {
  onSelect: (files: File[]) => void
  accept?: string
}

export default function UploadField({ onSelect, accept }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const trigger = () => inputRef.current?.click()
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onSelect(Array.from(e.target.files))
  }

  return (
    <div>
      <button
        onClick={trigger}
        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Select File
      </button>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={accept}
        onChange={onChange}
      />
    </div>
  )
}
