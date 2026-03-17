import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Login() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor } = useActor();
  const navigate = useNavigate();
  const [needsProfile, setNeedsProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    studentId: "",
    department: "",
  });

  useEffect(() => {
    if (!identity || !actor) return;
    setCheckingProfile(true);
    actor
      .getCallerUserProfile()
      .then((profile) => {
        if (profile) {
          navigate("/dashboard", { replace: true });
        } else {
          setNeedsProfile(true);
        }
      })
      .catch(() => {
        setNeedsProfile(true);
      })
      .finally(() => setCheckingProfile(false));
  }, [identity, actor, navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (!form.name || !form.email || !form.studentId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      await actor.saveCallerUserProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        studentId: form.studentId,
        department: form.department,
        role: UserRole.student,
      });
      toast.success("Profile saved!");
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (isInitializing || checkingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Printer className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Smart Campus Print</span>
        </div>

        {!identity ? (
          <Card>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                Sign in to access campus printing
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground text-center">
                Use Internet Identity to securely sign in to Smart Campus Print.
              </p>
              <Button onClick={login} disabled={isLoggingIn} className="w-full">
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In with Internet Identity"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                New users will set up a profile after signing in.
              </p>
            </CardContent>
          </Card>
        ) : needsProfile ? (
          <Card>
            <CardHeader>
              <CardTitle>Set up your profile</CardTitle>
              <CardDescription>
                Tell us about yourself to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSaveProfile}
                className="flex flex-col gap-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="you@college.edu"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input
                    id="studentId"
                    value={form.studentId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, studentId: e.target.value }))
                    }
                    placeholder="e.g. CS2021001"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dept">Department</Label>
                  <Input
                    id="dept"
                    value={form.department}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, department: e.target.value }))
                    }
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
