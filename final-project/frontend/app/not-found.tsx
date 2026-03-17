import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

const NotFound = () => {
  return (
    <div className="flex h-[90vh] flex-col items-center justify-center gap-4">
      <Image
        src="/assets/images/not-found.png"
        alt="404"
        width={800}
        height={800}
      />
      <p className="text-lg">The page you are looking for does not exist.</p>
      <Link href="/">
        <Button>Go Back</Button>
      </Link>
    </div>
  )
}

export default NotFound
