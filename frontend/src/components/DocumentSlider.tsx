import type { DocumentDefinition } from '../api'

interface Props {
  documents: DocumentDefinition[]
  selected: number | null
  onSelect: (id: number) => void
}

export default function DocumentSlider({ documents, selected, onSelect }: Props) {
  return (
    <ul className="space-y-2 border-r pr-2">
      {documents.map((d) => (
        <li
          key={d.id}
          className={`cursor-pointer p-2 rounded ${selected === d.id ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => onSelect(d.id)}
        >
          {d.name}
        </li>
      ))}
    </ul>
  )
}
