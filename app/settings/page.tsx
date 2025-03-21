"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Default settings
  const defaultSettings = {
    notifications: {
      emailNotifications: true,
      pollReminders: true,
      resultNotifications: false,
      leaderboardUpdates: true,
      newPollNotifications: true,
      predictionResults: true,
      systemAnnouncements: true,
    },
    privacy: {
      showProfilePublicly: true,
      showPredictionsPublicly: true,
      showPointsPublicly: true,
      allowTagging: true,
    },
    theme: {
      darkMode: false,
      highContrast: false,
      reducedMotion: false,
    },
  }

  // Settings state
  const [notificationSettings, setNotificationSettings] = useState(defaultSettings.notifications)
  const [privacySettings, setPrivacySettings] = useState(defaultSettings.privacy)
  const [themeSettings, setThemeSettings] = useState(defaultSettings.theme)

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return

      setIsFetching(true)
      setError(null)

      try {
        const response = await fetch("/api/settings")

        if (!response.ok) {
          throw new Error("Failed to fetch settings")
        }

        const data = await response.json()

        // Update state with user settings or use defaults
        if (data.settings) {
          if (data.settings.notifications) {
            setNotificationSettings({
              ...defaultSettings.notifications,
              ...data.settings.notifications,
            })
          }

          if (data.settings.privacy) {
            setPrivacySettings({
              ...defaultSettings.privacy,
              ...data.settings.privacy,
            })
          }

          if (data.settings.theme) {
            setThemeSettings({
              ...defaultSettings.theme,
              ...data.settings.theme,
            })
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        setError("Failed to load your settings. Using defaults instead.")
      } finally {
        setIsFetching(false)
      }
    }

    fetchSettings()
  }, [user])

  const handleNotificationChange = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key],
    })
  }

  const handlePrivacyChange = (key: keyof typeof privacySettings) => {
    setPrivacySettings({
      ...privacySettings,
      [key]: !privacySettings[key],
    })
  }

  const handleThemeChange = (key: keyof typeof themeSettings) => {
    setThemeSettings({
      ...themeSettings,
      [key]: !themeSettings[key],
    })
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifications: notificationSettings,
          privacy: privacySettings,
          theme: themeSettings,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save settings")
      }

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      setError(error instanceof Error ? error.message : "Failed to save settings. Please try again.")

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {error && (
        <Alert variant="warning">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="notifications">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationChange("emailNotifications")}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Poll Notifications</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-poll-notifications">New Polls</Label>
                      <p className="text-sm text-muted-foreground">Get notified when new polls are created</p>
                    </div>
                    <Switch
                      id="new-poll-notifications"
                      checked={notificationSettings.newPollNotifications}
                      onCheckedChange={() => handleNotificationChange("newPollNotifications")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="poll-reminders">Poll Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminders before polls close</p>
                    </div>
                    <Switch
                      id="poll-reminders"
                      checked={notificationSettings.pollReminders}
                      onCheckedChange={() => handleNotificationChange("pollReminders")}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Result Notifications</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="result-notifications">Match Results</Label>
                      <p className="text-sm text-muted-foreground">Be notified when match results are updated</p>
                    </div>
                    <Switch
                      id="result-notifications"
                      checked={notificationSettings.resultNotifications}
                      onCheckedChange={() => handleNotificationChange("resultNotifications")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="prediction-results">Prediction Results</Label>
                      <p className="text-sm text-muted-foreground">Get notified about your prediction results</p>
                    </div>
                    <Switch
                      id="prediction-results"
                      checked={notificationSettings.predictionResults}
                      onCheckedChange={() => handleNotificationChange("predictionResults")}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Other Notifications</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="leaderboard-updates">Leaderboard Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your position on the leaderboard
                      </p>
                    </div>
                    <Switch
                      id="leaderboard-updates"
                      checked={notificationSettings.leaderboardUpdates}
                      onCheckedChange={() => handleNotificationChange("leaderboardUpdates")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="system-announcements">System Announcements</Label>
                      <p className="text-sm text-muted-foreground">Important announcements about the platform</p>
                    </div>
                    <Switch
                      id="system-announcements"
                      checked={notificationSettings.systemAnnouncements}
                      onCheckedChange={() => handleNotificationChange("systemAnnouncements")}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your profile visibility and data sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Profile Visibility</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-profile">Show Profile Publicly</Label>
                    <p className="text-sm text-muted-foreground">Allow other users to view your profile</p>
                  </div>
                  <Switch
                    id="show-profile"
                    checked={privacySettings.showProfilePublicly}
                    onCheckedChange={() => handlePrivacyChange("showProfilePublicly")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-predictions">Show Predictions</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your predictions</p>
                  </div>
                  <Switch
                    id="show-predictions"
                    checked={privacySettings.showPredictionsPublicly}
                    onCheckedChange={() => handlePrivacyChange("showPredictionsPublicly")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-points">Show Points</Label>
                    <p className="text-sm text-muted-foreground">Display your points on the leaderboard</p>
                  </div>
                  <Switch
                    id="show-points"
                    checked={privacySettings.showPointsPublicly}
                    onCheckedChange={() => handlePrivacyChange("showPointsPublicly")}
                  />
                </div>

                <Separator />

                <h3 className="text-sm font-medium">Social Features</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-tagging">Allow Tagging</Label>
                    <p className="text-sm text-muted-foreground">Allow other users to tag you in comments</p>
                  </div>
                  <Switch
                    id="allow-tagging"
                    checked={privacySettings.allowTagging}
                    onCheckedChange={() => handlePrivacyChange("allowTagging")}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use dark theme for the application</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={themeSettings.darkMode}
                    onCheckedChange={() => handleThemeChange("darkMode")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">High Contrast</Label>
                    <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={themeSettings.highContrast}
                    onCheckedChange={() => handleThemeChange("highContrast")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduced-motion">Reduced Motion</Label>
                    <p className="text-sm text-muted-foreground">Minimize animations throughout the application</p>
                  </div>
                  <Switch
                    id="reduced-motion"
                    checked={themeSettings.reducedMotion}
                    onCheckedChange={() => handleThemeChange("reducedMotion")}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

