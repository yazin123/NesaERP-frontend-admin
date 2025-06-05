'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Save, RefreshCw, Mail, Bell, Shield, Database, Cloud, Users } from 'lucide-react';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    general: {
      companyName: 'NESA Corporation',
      timezone: 'UTC+3',
      dateFormat: 'DD/MM/YYYY',
      language: 'en',
      theme: 'light'
    },
    email: {
      smtpServer: 'smtp.company.com',
      smtpPort: '587',
      senderEmail: 'noreply@company.com',
      enableSSL: true,
      authentication: true
    },
    notifications: {
      enableEmailNotifications: true,
      enablePushNotifications: true,
      enableSystemAlerts: true,
      dailyDigest: true,
      maintenanceAlerts: true
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireNumbers: true,
        requireSymbols: true,
        requireUppercase: true,
        expiryDays: 90
      },
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      twoFactorAuth: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      backupTime: '00:00',
      includeAttachments: true
    },
    integrations: {
      enableAPI: true,
      apiRateLimit: 1000,
      webhookURL: 'https://api.company.com/webhook',
      enableLogging: true
    }
  });

  const timezones = ['UTC', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5'];
  const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
  const languages = ['en', 'fr', 'es', 'de', 'ar'];
  const themes = ['light', 'dark', 'system'];
  const backupFrequencies = ['hourly', 'daily', 'weekly', 'monthly'];

  const handleSave = () => {
    // TODO: Implement API call to save settings
    console.log('Saving settings:', settings);
  };

  const handleReset = () => {
    // TODO: Implement settings reset
    console.log('Resetting settings');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Settings</h1>
        
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.general.companyName}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, companyName: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, timezone: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={settings.general.dateFormat}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, dateFormat: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFormats.map((format) => (
                        <SelectItem key={format} value={format}>{format}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, language: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settings.general.theme}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, theme: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <SelectItem key={theme} value={theme}>
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input
                    id="smtpServer"
                    value={settings.email.smtpServer}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, smtpServer: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.email.smtpPort}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, smtpPort: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Sender Email</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={settings.email.senderEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, senderEmail: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableSSL">Enable SSL</Label>
                    <Switch
                      id="enableSSL"
                      checked={settings.email.enableSSL}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        email: { ...settings.email, enableSSL: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="authentication">Require Authentication</Label>
                    <Switch
                      id="authentication"
                      checked={settings.email.authentication}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        email: { ...settings.email, authentication: checked }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <Switch
                    id="emailNotifications"
                    checked={settings.notifications.enableEmailNotifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, enableEmailNotifications: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <Switch
                    id="pushNotifications"
                    checked={settings.notifications.enablePushNotifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, enablePushNotifications: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="systemAlerts">System Alerts</Label>
                  <Switch
                    id="systemAlerts"
                    checked={settings.notifications.enableSystemAlerts}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, enableSystemAlerts: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="dailyDigest">Daily Digest</Label>
                  <Switch
                    id="dailyDigest"
                    checked={settings.notifications.dailyDigest}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, dailyDigest: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceAlerts">Maintenance Alerts</Label>
                  <Switch
                    id="maintenanceAlerts"
                    checked={settings.notifications.maintenanceAlerts}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, maintenanceAlerts: checked }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Minimum Password Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    value={settings.security.passwordPolicy.minLength}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        passwordPolicy: {
                          ...settings.security.passwordPolicy,
                          minLength: parseInt(e.target.value)
                        }
                      }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                    <Switch
                      id="requireNumbers"
                      checked={settings.security.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: {
                            ...settings.security.passwordPolicy,
                            requireNumbers: checked
                          }
                        }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireSymbols">Require Symbols</Label>
                    <Switch
                      id="requireSymbols"
                      checked={settings.security.passwordPolicy.requireSymbols}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: {
                            ...settings.security.passwordPolicy,
                            requireSymbols: checked
                          }
                        }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <Switch
                      id="twoFactorAuth"
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: { ...settings.security, twoFactorAuth: checked }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={settings.backup.backupFrequency}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      backup: { ...settings.backup, backupFrequency: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {backupFrequencies.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retentionDays">Retention Days</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    value={settings.backup.retentionDays}
                    onChange={(e) => setSettings({
                      ...settings,
                      backup: { ...settings.backup, retentionDays: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupTime">Backup Time</Label>
                  <Input
                    id="backupTime"
                    type="time"
                    value={settings.backup.backupTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      backup: { ...settings.backup, backupTime: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoBackup">Automatic Backup</Label>
                    <Switch
                      id="autoBackup"
                      checked={settings.backup.autoBackup}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, autoBackup: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeAttachments">Include Attachments</Label>
                    <Switch
                      id="includeAttachments"
                      checked={settings.backup.includeAttachments}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, includeAttachments: checked }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={settings.integrations.apiRateLimit}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, apiRateLimit: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookURL">Webhook URL</Label>
                  <Input
                    id="webhookURL"
                    value={settings.integrations.webhookURL}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, webhookURL: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableAPI">Enable API</Label>
                    <Switch
                      id="enableAPI"
                      checked={settings.integrations.enableAPI}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        integrations: { ...settings.integrations, enableAPI: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableLogging">Enable Logging</Label>
                    <Switch
                      id="enableLogging"
                      checked={settings.integrations.enableLogging}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        integrations: { ...settings.integrations, enableLogging: checked }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 