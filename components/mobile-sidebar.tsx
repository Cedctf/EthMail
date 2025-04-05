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

      <nav className="grid gap-1 px-2">
         <Button variant="ghost" className="justify-start gap-3 px-3" asChild>
          <Link href="/">
            <Inbox className="h-4 w-4" />
            <span>Inbox</span>
            <span className="ml-auto rounded-full bg-primary px-2 text-xs text-primary-foreground">24</span>
          </Link>
        </Button>
        <Button variant="ghost" className="justify-start gap-3 px-3" asChild>
          <Link href="/starred">
            <Star className="h-4 w-4" />
            <span>Starred</span>
          </Link>
        </Button>
        <Button variant="ghost" className="justify-start gap-3 px-3" asChild>
          <Link href="/snoozed">
            <Clock className="h-4 w-4" />
            <span>Snoozed</span>
          </Link>
        </Button>
        <Button variant="ghost" className="justify-start gap-3 px-3" asChild>
          <Link href="/sent">
            <Send className="h-4 w-4" />
            <span>Sent</span>
          </Link>
        </Button>
        <Button variant="ghost" className="justify-start gap-3 px-3" asChild>
          <Link href="/drafts">
            <File className="h-4 w-4" />
            <span>Drafts</span>
            <span className="ml-auto rounded-full bg-muted px-2 text-xs">3</span>
          </Link>
        </Button>
        <Button variant="ghost" className="justify-start gap-3 px-3" asChild>
          <Link href="/archive">
            <Archive className="h-4 w-4" />
            <span>Archive</span>
          </Link>
        </Button>
        <Button variant="ghost" className="justify-start gap-3 px-3" asChild>
          <Link href="/trash">
            <Trash className="h-4 w-4" />
            <span>Trash</span>
          </Link>
        </Button>
      </nav>
    </ScrollArea>
  )
}
