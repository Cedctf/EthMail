import Link from "next/link"
import { Archive, ChevronRight, Clock, File, Inbox, MailPlus, Send, Star, Trash } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

export function MobileSidebar() {
  return (
    <ScrollArea className="h-full">
        <div className="flex flex-col gap-2 p-4">
        <Button className="w-full justify-start gap-2" asChild>
          <Link href="/compose">
            <MailPlus className="h-4 w-4" />
            <span>Compose</span>
          </Link>
        </Button>
      </div>
    </ScrollArea>
  )
}
