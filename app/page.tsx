"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import HowItWorks from "@/components/how-it-works"
import { CheckCircle, CreditCard } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { ArticleBar } from "@/components/article-bar"

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                    Pay all QR code in laos with <span className="text-amber-500">Lightning Network</span>
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    use your bitcoin to pay at local merchants in laos
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="bg-amber-500 hover:bg-amber-600" asChild>
                    <Link href="/pay">
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t("home.hero.payButton")}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/images/qr-payment-scan.jpeg"
                  alt="Person scanning a QR code to pay at a merchant"
                  width={600}
                  height={400}
                  className="rounded-lg object-cover shadow-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-gray-50 dark:bg-gray-900 py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t("home.howItWorks.title")}
                </h2>
                <p className="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("home.howItWorks.subtitle")}
                </p>
              </div>
              <div className="mx-auto w-full max-w-3xl">
                <HowItWorks />
              </div>
              <div className="flex justify-center pt-8">
                <Button className="bg-amber-500 hover:bg-amber-600" asChild>
                  <Link href="/pay">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t("home.howItWorks.getStarted")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Article Bar Section */}
        <ArticleBar />

        {/* About Section */}
        <section className="bg-gray-50 dark:bg-gray-900 py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t("home.about.title")}</h2>
                <p className="text-gray-500 dark:text-gray-400 md:text-xl/relaxed">{t("home.about.description")}</p>
                <p className="text-gray-500 dark:text-gray-400">{t("home.about.founded")}</p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                  <Button
                    variant="outline"
                    className="border-amber-500 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    asChild
                  >
                    <Link href="/about">{t("home.about.learnMore")}</Link>
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">{t("home.about.vision.title")}</h3>
                <p className="text-gray-500 dark:text-gray-400">{t("home.about.vision.description")}</p>

                <h3 className="text-xl font-bold">{t("home.about.differences.title")}</h3>
                <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                  {t("home.about.differences.items").map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 rounded-full bg-amber-500 p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
