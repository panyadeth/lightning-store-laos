import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Globe, Shield, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-20">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl pb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Our Story</h1>
        <p className="mx-auto mt-6 max-w-3xl text-gray-500 md:text-xl/relaxed">
          CryptoQR was founded with a simple mission: to make cryptocurrency useful in everyday life by enabling anyone
          to pay with crypto at any merchant that accepts QR code payments.
        </p>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-5xl py-12">
        <div className="relative border-l border-gray-200 dark:border-gray-700 pl-8">
          <div className="mb-10 ml-6">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 ring-8 ring-white dark:ring-gray-900">
              <span className="h-3 w-3 rounded-full bg-white"></span>
            </span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Founded CryptoQR</h3>
            <time className="mb-2 block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              January 2023
            </time>
            <p className="text-base font-normal text-gray-500 dark:text-gray-400">
              CryptoQR was established with the goal of bridging the gap between cryptocurrency and everyday payments.
            </p>
          </div>
          <div className="mb-10 ml-6">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 ring-8 ring-white dark:ring-gray-900">
              <span className="h-3 w-3 rounded-full bg-white"></span>
            </span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">First Market Launch</h3>
            <time className="mb-2 block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              March 2023
            </time>
            <p className="text-base font-normal text-gray-500 dark:text-gray-400">
              Successfully launched our service in Thailand, enabling Bitcoin payments for any Thai QR code.
            </p>
          </div>
          <div className="mb-10 ml-6">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 ring-8 ring-white dark:ring-gray-900">
              <span className="h-3 w-3 rounded-full bg-white"></span>
            </span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Expanded Cryptocurrency Support</h3>
            <time className="mb-2 block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              June 2023
            </time>
            <p className="text-base font-normal text-gray-500 dark:text-gray-400">
              Added support for multiple cryptocurrencies including Ethereum, Litecoin, and stablecoins.
            </p>
          </div>
          <div className="ml-6">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 ring-8 ring-white dark:ring-gray-900">
              <span className="h-3 w-3 rounded-full bg-white"></span>
            </span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Global Expansion</h3>
            <time className="mb-2 block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              Present
            </time>
            <p className="text-base font-normal text-gray-500 dark:text-gray-400">
              Currently expanding to new markets across Asia and beyond, with a focus on regions with high QR code
              adoption.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Team</h2>
          <p className="mx-auto mt-4 max-w-3xl text-gray-500">
            We're a diverse team of crypto enthusiasts, payment experts, and technologists committed to making
            cryptocurrency accessible to everyone.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            {
              name: "Alex Johnson",
              role: "Founder & CEO",
              bio: "Former fintech executive with 10+ years experience in payment systems",
              avatar: "/placeholder.svg?height=300&width=300",
            },
            {
              name: "Sarah Chen",
              role: "CTO",
              bio: "Blockchain developer and architect with experience at major crypto exchanges",
              avatar: "/placeholder.svg?height=300&width=300",
            },
            {
              name: "Michael Rodriguez",
              role: "Head of Operations",
              bio: "International business development expert specializing in APAC markets",
              avatar: "/placeholder.svg?height=300&width=300",
            },
          ].map((member, index) => (
            <Card key={index}>
              <CardContent className="flex flex-col items-center p-6">
                <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100">
                  <img
                    src={member.avatar || "/placeholder.svg"}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-4 text-xl font-bold">{member.name}</h3>
                <p className="text-sm text-amber-500">{member.role}</p>
                <p className="mt-2 text-center text-gray-500">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 dark:bg-gray-900 my-12 py-12 rounded-lg">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Values</h2>
          <p className="mx-auto mt-4 max-w-3xl text-gray-500 dark:text-gray-400">
            The principles that guide everything we do at CryptoQR
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <Users className="h-10 w-10 text-amber-500" />,
              title: "Accessibility",
              description: "Making cryptocurrency accessible to everyone, regardless of technical knowledge",
            },
            {
              icon: <Globe className="h-10 w-10 text-amber-500" />,
              title: "Global Mindset",
              description: "Building solutions that work across borders and currencies",
            },
            {
              icon: <Shield className="h-10 w-10 text-amber-500" />,
              title: "Security",
              description: "Ensuring the highest standards of security for all transactions",
            },
            {
              icon: <Award className="h-10 w-10 text-amber-500" />,
              title: "Excellence",
              description: "Striving for excellence in every aspect of our service",
            },
          ].map((value, index) => (
            <Card key={index} className="border-none shadow-none bg-transparent">
              <CardContent className="flex flex-col items-center p-6">
                <div className="mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 p-3">{value.icon}</div>
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="mt-2 text-center text-gray-500 dark:text-gray-400">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl py-12 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Join Our Mission</h2>
        <p className="mx-auto mt-4 max-w-3xl text-gray-500">
          Whether you're a user, merchant, or potential partner, we'd love to have you join us in revolutionizing how
          cryptocurrency is used in everyday life.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button className="bg-amber-500 hover:bg-amber-600">Get Started</Button>
          <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-50">
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  )
}
