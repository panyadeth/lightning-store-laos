"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Wallet, CheckCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function HowItWorks() {
  const { t, language } = useLanguage()

  const steps = [
    {
      icon: <QrCode className="h-10 w-10 text-amber-500" />,
      title: language === "EN" ? "Scan QR Code" : language === "TH" ? "สแกน QR Code" : "ສະແກນ QR Code",
      description:
        language === "EN"
          ? "Scan any merchant's QR code with our app"
          : language === "TH"
            ? "สแกน QR code ของร้านค้าใดๆ ด้วยแอปของเรา"
            : "ສະແກນ QR code ຂອງຮ້ານຄ້າໃດກໍ່ໄດ້ດ້ວຍແອັບຂອງພວກເຮົາ",
    },
    {
      icon: <Wallet className="h-10 w-10 text-amber-500" />,
      title: language === "EN" ? "Pay with Crypto" : language === "TH" ? "ชำระด้วย Crypto" : "ຈ່າຍດ້ວຍ Crypto",
      description:
        language === "EN"
          ? "Select your preferred cryptocurrency and confirm payment"
          : language === "TH"
            ? "เลือกคริปโตเคอร์เรนซีที่คุณต้องการและยืนยันการชำระเงิน"
            : "ເລືອກ cryptocurrency ທີ່ທ່ານຕ້ອງການແລະຢືນຢັນການຈ່າຍເງິນ",
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-amber-500" />,
      title: language === "EN" ? "Instant Confirmation" : language === "TH" ? "ยืนยันทันที" : "ຢືນຢັນທັນທີ",
      description:
        language === "EN"
          ? "The merchant receives payment in their local currency"
          : language === "TH"
            ? "ร้านค้าได้รับการชำระเงินในสกุลเงินท้องถิ่นของพวกเขา"
            : "ຮ້ານຄ້າໄດ້ຮັບການຈ່າຍເງິນໃນສະກຸນເງິນທ້ອງຖິ່ນຂອງພວກເຂົາ",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {steps.map((step, index) => (
        <Card key={index} className="relative overflow-hidden">
          <div className="absolute -right-4 -top-4 z-0 h-24 w-24 rounded-full bg-amber-100 dark:bg-amber-900/30 opacity-80" />
          <CardHeader className="relative z-10">
            <div className="mb-2">{step.icon}</div>
            <CardTitle className="text-xl">
              <span className="mr-2 inline-block rounded-full bg-amber-500 px-2 py-1 text-xs text-white">
                {index + 1}
              </span>
              {step.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <CardDescription className="text-base dark:text-gray-400">{step.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
