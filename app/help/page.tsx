"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Mail, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter FAQs based on search term
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">Find answers to common questions and get support</p>
      </div>

      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for help..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="faq">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Common questions about the IPL Prediction Portal</CardDescription>
            </CardHeader>
            <CardContent>
              {searchTerm && filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
                  <p className="text-sm mt-2">Try a different search term or contact support</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {(searchTerm ? filteredFaqs : faqs).map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>
                        <div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="guides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Guides</CardTitle>
              <CardDescription>Step-by-step guides to help you use the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {guides.map((guide, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-40 bg-muted flex items-center justify-center">
                      <guide.icon className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg mb-2">{guide.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                      <Button asChild variant="outline" size="sm">
                        <Link href={guide.link}>Read Guide</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get help from our support team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Support
                    </CardTitle>
                    <CardDescription>Send us an email for assistance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our support team typically responds within 24 hours on business days.
                    </p>
                    <Button asChild>
                      <a href="mailto:support@iplprediction.com">Email Support</a>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Live Chat
                    </CardTitle>
                    <CardDescription>Chat with our support team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Available Monday to Friday, 9 AM to 6 PM IST.</p>
                    <Button>Start Chat</Button>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Submit a Support Ticket</h3>
                <form className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="Your email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input id="subject" placeholder="Subject of your inquiry" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Describe your issue or question"
                      className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    ></textarea>
                  </div>
                  <Button type="submit">Submit Ticket</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const faqs = [
  {
    question: "How do I create an account?",
    answer:
      "To create an account, click on the <strong>Register</strong> button on the homepage. Fill in your details including name, email, and password. Once submitted, you'll receive a confirmation email to verify your account.",
  },
  {
    question: "How does the points system work?",
    answer:
      "You earn points for correct predictions. For match winner predictions, you earn 30 points for each correct prediction. For Man of the Match predictions, you earn 50 points for each correct prediction. Your total points determine your position on the leaderboard.",
  },
  {
    question: "When do polls close for voting?",
    answer:
      "Polls typically close 30 minutes before the match starts. The exact closing time is displayed on each poll. Make sure to submit your predictions before the poll closes.",
  },
  {
    question: "Can I change my prediction after submitting?",
    answer:
      "No, once you submit a prediction, it cannot be changed. Make sure you're confident in your selection before submitting.",
  },
  {
    question: "How is the leaderboard calculated?",
    answer:
      "The leaderboard ranks users based on their total points. In case of a tie, the user with more correct predictions is ranked higher. If there's still a tie, the user who joined earlier gets the higher rank.",
  },
  {
    question: "I forgot my password. How do I reset it?",
    answer:
      "On the login page, click on the <strong>Forgot password?</strong> link. Enter your email address, and we'll send you instructions to reset your password.",
  },
  {
    question: "How do I become an admin?",
    answer:
      "Admin access is granted by existing administrators. If you need admin privileges, please contact support with your request and reason.",
  },
  {
    question: "Can I delete my account?",
    answer:
      "Yes, you can delete your account from your profile settings. Go to <strong>Profile > Settings > Account</strong> and click on <strong>Delete Account</strong>. Note that this action is irreversible.",
  },
]

const guides = [
  {
    title: "Getting Started",
    description: "Learn the basics of using the IPL Prediction Portal",
    link: "/help/guides/getting-started",
    icon: Search,
  },
  {
    title: "Making Predictions",
    description: "How to vote on matches and submit your predictions",
    link: "/help/guides/making-predictions",
    icon: MessageSquare,
  },
  {
    title: "Understanding the Leaderboard",
    description: "How points are calculated and rankings work",
    link: "/help/guides/leaderboard",
    icon: Mail,
  },
  {
    title: "Admin Guide",
    description: "Managing polls, users, and viewing statistics",
    link: "/help/guides/admin",
    icon: Search,
  },
]

