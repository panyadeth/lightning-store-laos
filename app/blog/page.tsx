"use client"

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Tag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"

export default function BlogPage() {
  const { t } = useLanguage()

  const articles = [
    {
      id: "intro-lightning",
      title: "Introduction to Lightning Network: Bitcoin's Scaling Solution",
      description:
        "Learn how Lightning Network enables fast, low-cost Bitcoin transactions and why it's revolutionizing cryptocurrency payments.",
      image: "/lightning-network-intro.jpg",
      date: "May 15, 2023",
      category: "Education",
      readTime: "5 min read",
    },
    {
      id: "merchant-benefits",
      title: "5 Ways Merchants Benefit from Lightning Network Payments",
      description:
        "Discover how businesses can reduce fees, eliminate chargebacks, and attract new customers by accepting Lightning Network payments.",
      image: "/lightning-network-merchant.jpg",
      date: "June 22, 2023",
      category: "Business",
      readTime: "4 min read",
    },
    {
      id: "lightning-wallets",
      title: "Best Lightning Network Wallets for Everyday Use",
      description:
        "A comparison of the top Lightning Network wallets for both beginners and advanced users, with focus on security and usability.",
      image: "/lightning-network-wallet.jpg",
      date: "July 8, 2023",
      category: "Reviews",
      readTime: "7 min read",
    },
    {
      id: "lightning-laos",
      title: "Lightning Network Adoption in Laos: A Case Study",
      description:
        "How Lightning Network is gaining traction in Laos and enabling financial inclusion for the unbanked population.",
      image: "/lightning-network-laos.jpg",
      date: "August 3, 2023",
      category: "Case Study",
      readTime: "6 min read",
    },
    {
      id: "lightning-future",
      title: "The Future of Lightning Network: Upcoming Features and Improvements",
      description:
        "Explore upcoming Lightning Network developments including Taproot integration, channel factories, and more.",
      image: "/lightning-network-future.jpg",
      date: "September 12, 2023",
      category: "Technology",
      readTime: "8 min read",
    },
  ]

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Lightning Network Blog</h1>
          <p className="text-gray-500 dark:text-gray-400 md:text-xl">
            Latest news, tutorials, and insights about Lightning Network and cryptocurrency payments
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                    <Tag className="mr-1 h-3 w-3" />
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {article.readTime}
                  </span>
                </div>
                <CardTitle className="mt-2 line-clamp-2 text-xl">{article.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2">{article.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-between border-t p-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">{article.date}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 dark:text-amber-400"
                  asChild
                >
                  <Link href={`/blog/${article.id}`}>
                    {t("articles.readMore")}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
