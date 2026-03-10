import AddPersonForm from "@/components/AddPersonForm"
import GetPerson from "@/components/GetPerson"
// import GetPersons from "@/components/GetPersons"

export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-zinc-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Personnel Registry</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <AddPersonForm />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <GetPerson />
          </div>

          {/* <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <GetPersons />
          </div> */}
        </div>
      </div>
    </main>
  )
}
