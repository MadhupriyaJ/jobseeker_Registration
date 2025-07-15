import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProfileDetailModal } from "@/components/profile-detail-modal";
import { Search, Eye, Download, Users, ArrowUpDown } from "lucide-react";
import { Jobseeker } from "@shared/schema";
import {
  skillOptions,
  experienceOptions,
  getSkillLabel,
  getExperienceLabel,
} from "@/lib/types";

export default function Dashboard() {
  const [selectedJobseeker, setSelectedJobseeker] = useState<Jobseeker | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const { data: jobseekers = [], isLoading } = useQuery<Jobseeker[]>({
    queryKey: ["/api/jobseekers"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5050/jobseekers");
      if (!res.ok) throw new Error("Failed to fetch jobseekers");
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  console.log("jobseeker",jobseekers)
  const filteredJobseekers = useMemo(() => {
    return jobseekers.filter((jobseeker) => {
      const matchesSearch =
        !searchTerm ||
        jobseeker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jobseeker.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSkill =
        skillFilter === "all" || jobseeker.skill === skillFilter;
      const matchesExperience =
        experienceFilter === "all" || jobseeker.experience === experienceFilter;
      const matchesLocation =
        locationFilter === "all" ||
        jobseeker.location.toLowerCase().includes(locationFilter.toLowerCase());

      return (
        matchesSearch && matchesSkill && matchesExperience && matchesLocation
      );
    });
  }, [jobseekers, searchTerm, skillFilter, experienceFilter, locationFilter]);

  const handleDownloadResume = (jobseeker: Jobseeker) => {
    const link = document.createElement("a");
    link.href = `http://localhost:5050/jobseekers/${jobseeker.id}/resume`;
    link.download = jobseeker.resumeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

const getInitials = (name?: string) => {
  if (!name) return "NA";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};


  const uniqueLocations = useMemo(() => {
    const locations = jobseekers.map((j) => j.location);
    return [...new Set(locations)].sort();
  }, [jobseekers]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">Jobseeker Profiles</CardTitle>
              <p className="text-muted-foreground">
                Manage and review candidate applications
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-800"
              >
                <Users className="h-4 w-4 mr-2" />
                {jobseekers.length} Active Profiles
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Search and Filter Section */}
        <CardContent className="p-0">
          <div className="p-4 border-b bg-slate-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Skills" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    {skillOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={experienceFilter}
                  onValueChange={setExperienceFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experience</SelectItem>
                    {experienceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={locationFilter}
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Profiles Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-2">
                      Name
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-2">
                      Skill
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-2">
                      Experience
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-2">
                      Location
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobseekers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No jobseekers found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobseekers.map((jobseeker) => (
                    <TableRow
                      key={jobseeker.id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => setSelectedJobseeker(jobseeker)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium text-sm">
                              {getInitials(jobseeker.fullName)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {jobseeker.fullName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {jobseeker.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          {getSkillLabel(jobseeker.skill)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getExperienceLabel(jobseeker.experience)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {jobseeker.location}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className="bg-emerald-100 text-emerald-800"
                        >
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                          {jobseeker.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJobseeker(jobseeker);
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadResume(jobseeker);
                            }}
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ProfileDetailModal
        jobseeker={selectedJobseeker}
        open={!!selectedJobseeker}
        onClose={() => setSelectedJobseeker(null)}
      />
    </div>
  );
}
