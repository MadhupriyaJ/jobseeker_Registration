import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Mail, Phone, MapPin, User, Briefcase } from "lucide-react";
import { Jobseeker } from "@shared/schema";
import { getSkillLabel, getExperienceLabel, getGenderLabel } from "@/lib/types";

interface ProfileDetailModalProps {
  jobseeker: Jobseeker | null;
  open: boolean;
  onClose: () => void;
}

export function ProfileDetailModal({ jobseeker, open, onClose }: ProfileDetailModalProps) {
  if (!jobseeker) return null;

  const handleDownloadResume = () => {
    const link = document.createElement('a');
    link.href = `/api/jobseekers/${jobseeker.id}/resume`;
    link.download = jobseeker.resumeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-lg">
                {getInitials(jobseeker.fullName)}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{jobseeker.fullName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {jobseeker.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {jobseeker.contactNumber}
              </div>
            </div>
          </div>

          {/* Profile Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gender</label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4" />
                  <span>{getGenderLabel(jobseeker.gender)}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Age</label>
                <p className="mt-1">{jobseeker.age} years old</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Skill/Trade</label>
                <div className="mt-1">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {getSkillLabel(jobseeker.skill)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Experience</label>
                <div className="flex items-center gap-2 mt-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{getExperienceLabel(jobseeker.experience)}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preferred Location</label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{jobseeker.location}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant="default" className="bg-emerald-100 text-emerald-800">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    {jobseeker.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Section */}
          <div className="pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Resume</label>
                <p className="text-sm text-muted-foreground mt-1">{jobseeker.resumeFileName}</p>
              </div>
              <Button onClick={handleDownloadResume} className="bg-primary hover:bg-primary/90">
                <Download className="h-4 w-4 mr-2" />
                Download Resume
              </Button>
            </div>
          </div>

          {/* Registration Date */}
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Registered on {new Date(jobseeker.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Mail className="h-4 w-4 mr-2" />
            Contact Candidate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
