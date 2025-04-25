import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DollarSign, Users, TrendingUp, Gift } from "lucide-react"

export default function EarnPage() {
  return (
    <div className="container flex flex-col items-center justify-center py-10 md:py-20">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Earn with CryptoQR</h1>
          <p className="text-gray-500">Multiple ways to earn rewards and cryptocurrency</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-amber-500" />
                Referral Program
              </CardTitle>
              <CardDescription>Invite friends and earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">Earn 10% of the transaction fees from users you refer to our platform.</p>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500">Your Referral Link</p>
                <div className="mt-1 flex items-center space-x-2">
                  <Input value="https://cryptoqr.com/ref/user123" readOnly />
                  <Button variant="outline" size="sm">
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-amber-500 hover:bg-amber-600">Share Referral Link</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-amber-500" />
                Liquidity Provider
              </CardTitle>
              <CardDescription>Provide liquidity and earn interest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">Deposit cryptocurrency to our liquidity pool and earn up to 8% APY.</p>
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500">Current APY</p>
                  <p className="text-sm font-bold text-amber-500">8.2%</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500">Min Deposit</p>
                  <p className="text-sm font-medium">0.01 BTC</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-amber-500 hover:bg-amber-600">Deposit Funds</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-amber-500" />
                Staking Rewards
              </CardTitle>
              <CardDescription>Stake tokens for passive income</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">Stake CQR tokens and earn rewards from transaction fees on our platform.</p>
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500">Staking Reward</p>
                  <p className="text-sm font-bold text-amber-500">12.5% APY</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500">Lock Period</p>
                  <p className="text-sm font-medium">30 days</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-amber-500 hover:bg-amber-600">Stake Tokens</Button>
            </CardFooter>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="mr-2 h-5 w-5 text-amber-500" />
                Rewards Program
              </CardTitle>
              <CardDescription>Earn points for every transaction and redeem for rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-gray-500">Your Points</p>
                  <p className="mt-1 text-3xl font-bold">0</p>
                  <p className="mt-2 text-xs text-gray-500">Earn 1 point for every $1 equivalent spent</p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-gray-500">Cashback Rate</p>
                  <p className="mt-1 text-3xl font-bold">1%</p>
                  <p className="mt-2 text-xs text-gray-500">Current cashback rate on all transactions</p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-gray-500">Next Tier</p>
                  <p className="mt-1 text-3xl font-bold">Silver</p>
                  <p className="mt-2 text-xs text-gray-500">Spend $500 more to reach Silver tier (1.5% cashback)</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View Reward History</Button>
              <Button className="bg-amber-500 hover:bg-amber-600">Redeem Points</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
