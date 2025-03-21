import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BirdIcon as Cricket } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cricket className="h-6 w-6" />
          <h1 className="text-xl font-bold">IPL Prediction Portal</h1>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="outline" className="bg-primary-foreground text-primary">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button>Register</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 px-6 bg-gradient-to-b from-primary/20 to-background">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Predict. Vote. Win.</h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Join the IPL Prediction Portal to vote on match outcomes and Man of the Match selections. Compete with
              other fans and test your cricket knowledge!
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="Predict Match Winners"
                description="Vote on which team will win upcoming IPL matches before they begin."
                number="1"
              />
              <FeatureCard
                title="Select Man of the Match"
                description="Predict which player will be awarded the Man of the Match."
                number="2"
              />
              <FeatureCard
                title="Track Your Results"
                description="See how your predictions compare with the actual match outcomes."
                number="3"
              />
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Test Your Cricket Knowledge?</h2>
            <p className="text-xl mb-8">Join thousands of cricket fans making predictions on IPL matches.</p>
            <Link href="/register">
              <Button size="lg">Sign Up Now</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-8 px-6">
        <div className="max-w-5xl mx-auto text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} IPL Prediction Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description, number }: { title: string; description: string; number: string }) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border">
      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

