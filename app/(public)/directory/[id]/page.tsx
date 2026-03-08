export default function OrphanageProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-container px-6 py-16">
      <h1 className="text-4xl font-bold text-[--color-text-primary]">Orphanage Profile</h1>
      <p className="mt-4 text-[--color-text-secondary]">ID: {params.id} — Week 2 implementation</p>
    </div>
  )
}
