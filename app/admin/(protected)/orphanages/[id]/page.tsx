export default function OrphanageDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white">Orphanage Detail</h2>
      <p className="mt-2 text-sm text-zinc-400">ID: {params.id} — Week 2 implementation</p>
    </div>
  )
}
