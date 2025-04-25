"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function BlogArticlePage() {
  const params = useParams()
  const slug = params.slug

  // In a real app, you would fetch the article data based on the slug
  // For this example, we'll use hardcoded data
  const article = {
    title: "Introduction to Lightning Network: Bitcoin's Scaling Solution",
    date: "May 15, 2023",
    author: "Alex Johnson",
    category: "Education",
    readTime: "5 min read",
    image: "/lightning-network-intro.jpg",
    content: `
      <p>The Lightning Network is a "layer 2" payment protocol that operates on top of a blockchain-based cryptocurrency (like Bitcoin). It enables fast transactions between participating nodes and has been proposed as a solution to the bitcoin scalability problem.</p>
      
      <h2>How Lightning Network Works</h2>
      
      <p>The Lightning Network works by creating a network of payment channels between users. These channels allow users to make multiple transactions without committing all of them to the blockchain. Only the opening and closing of a channel get recorded on the blockchain, which significantly reduces transaction fees and time.</p>
      
      <p>Here's a simplified explanation of how it works:</p>
      
      <ol>
        <li>Two users create a payment channel by committing a transaction to the blockchain.</li>
        <li>They can now conduct unlimited transactions between themselves without touching the blockchain.</li>
        <li>Each transaction updates the balance allocation between the two users.</li>
        <li>When they're done, they close the channel, and the final balance is committed to the blockchain.</li>
      </ol>
      
      <h2>Benefits of Lightning Network</h2>
      
      <p>The Lightning Network offers several advantages:</p>
      
      <ul>
        <li><strong>Speed:</strong> Transactions are nearly instant, as they don't need to be confirmed by the blockchain.</li>
        <li><strong>Low Fees:</strong> Since fewer transactions are recorded on the blockchain, fees are significantly reduced.</li>
        <li><strong>Scalability:</strong> The network can handle millions to billions of transactions per second, far exceeding what the base blockchain layer can process.</li>
        <li><strong>Micropayments:</strong> The low fees make it practical to send very small amounts of cryptocurrency.</li>
      </ul>
      
      <h2>Real-World Applications</h2>
      
      <p>The Lightning Network is enabling new use cases for Bitcoin and other cryptocurrencies:</p>
      
      <ul>
        <li>Instant retail payments at physical stores</li>
        <li>Online micropayments for content or services</li>
        <li>Cross-border remittances with minimal fees</li>
        <li>Machine-to-machine payments in IoT ecosystems</li>
      </ul>
      
      <p>As adoption grows, we're likely to see even more innovative applications built on top of this technology.</p>
    `,
  }

  return (
    <div className="container py-12 max-w-4xl">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Link>
      </Button>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{article.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            {article.date}
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {article.readTime}
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
              <Tag className="mr-1 h-3 w-3" />
              {article.category}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-lg">
        <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
      </div>

      <div
        className="prose prose-amber dark:prose-invert max-w-none mt-8"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  )
}
