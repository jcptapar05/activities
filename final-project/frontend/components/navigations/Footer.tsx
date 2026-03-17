const Footer = () => {
  return (
    <footer className="mt-12 border-t bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
        <div className="text-lg font-semibold text-gray-800">📚 Book Store</div>

        <ul className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-600">
          <li className="cursor-pointer transition hover:text-black">Home</li>
          <li className="cursor-pointer transition hover:text-black">
            Marketplace
          </li>
          <li className="cursor-pointer transition hover:text-black">
            My Books
          </li>
        </ul>
      </div>

      <div className="pb-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Book Store. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
