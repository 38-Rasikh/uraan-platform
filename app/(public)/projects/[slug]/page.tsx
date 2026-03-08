export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="mx-auto max-w-container px-6 py-16">
      <h1 className="text-4xl font-bold text-[--color-text-primary]">Project Detail</h1>
      <p className="mt-4 text-[--color-text-secondary]">
        Slug: {params.slug} — Week 4 implementation
      </p>
    </div>
  )
}
