export interface SkillOption {
  value: string;
  label: string;
}

export const skillOptions: SkillOption[] = [
  { value: "software-developer", label: "Software Developer" },
  { value: "web-developer", label: "Web Developer" },
  { value: "data-scientist", label: "Data Scientist" },
  { value: "ui-ux-designer", label: "UI/UX Designer" },
  { value: "project-manager", label: "Project Manager" },
  { value: "business-analyst", label: "Business Analyst" },
  { value: "digital-marketer", label: "Digital Marketer" },
  { value: "accountant", label: "Accountant" },
  { value: "hr-specialist", label: "HR Specialist" },
  { value: "sales-representative", label: "Sales Representative" },
];

export interface ExperienceOption {
  value: string;
  label: string;
}

export const experienceOptions: ExperienceOption[] = [
  { value: "0-1", label: "0-1 years" },
  { value: "1-3", label: "1-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
];

export interface GenderOption {
  value: string;
  label: string;
}

export const genderOptions: GenderOption[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export const getSkillLabel = (value: string): string => {
  const skill = skillOptions.find(option => option.value === value);
  return skill ? skill.label : value;
};

export const getExperienceLabel = (value: string): string => {
  const experience = experienceOptions.find(option => option.value === value);
  return experience ? experience.label : value;
};

export const getGenderLabel = (value: string): string => {
  const gender = genderOptions.find(option => option.value === value);
  return gender ? gender.label : value;
};
