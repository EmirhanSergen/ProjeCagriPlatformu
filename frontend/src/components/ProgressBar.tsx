interface Props {
  value: number
}

export default function ProgressBar({ value }: Props) {
  return (
    <div className="w-full bg-gray-200 h-2 rounded">
      <div className="bg-blue-500 h-2 rounded" style={{ width: `${value}%` }} />
    </div>
  )
}
