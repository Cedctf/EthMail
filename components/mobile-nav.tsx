"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Search, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileSidebar } from "@/components/mobile-sidebar"

export function MobileNav() {
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    return (
        <div>
            <h1>Mobile Nav</h1>
        </div>
    )
}
