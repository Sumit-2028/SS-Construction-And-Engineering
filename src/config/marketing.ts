import { Building2, DraftingCompass, Hammer, HardHat, House, Landmark, Paintbrush, Wrench } from "lucide-react";

export const services = [
  {
    title: "House Construction",
    slug: "house-construction",
    icon: House,
    type: "HOUSE_CONSTRUCTION",
    summary:
      "End-to-end residential construction with planning, structure, finishes, and handover."
  },
  {
    title: "Building Construction",
    slug: "building-construction",
    icon: Building2,
    type: "BUILDING_CONSTRUCTION",
    summary:
      "Corporate, commercial, and multi-storey building execution with strong site controls."
  },
  {
    title: "Civil Contracting",
    slug: "civil-contracting",
    icon: Landmark,
    type: "CIVIL_CONTRACTING",
    summary:
      "Civil works, infrastructure packages, concrete works, and contract execution."
  },
  {
    title: "Renovation",
    slug: "renovation",
    icon: Wrench,
    type: "RENOVATION",
    summary:
      "Structural, interior, facade, and functional renovations for homes and buildings."
  }
] as const;

export const specializations = [
  {
    title: "Structural Work",
    icon: HardHat,
    copy: "RCC, masonry, foundations, slabs, and quality-controlled structural execution."
  },
  {
    title: "Architectural Planning",
    icon: DraftingCompass,
    copy: "Practical planning support for layouts, approvals, elevation, and site constraints."
  },
  {
    title: "Turnkey Delivery",
    icon: Hammer,
    copy: "Material, labor, vendor, schedule, and site coordination under one accountable team."
  },
  {
    title: "Renovation Finishes",
    icon: Paintbrush,
    copy: "Premium finishing, repair, remodeling, waterproofing, and handover-ready detailing."
  }
] as const;

export const projects = [
  {
    title: "Mehta Residence",
    location: "Whitefield, Bengaluru",
    type: "House Construction",
    status: "In Progress",
    metric: "3,800 sqft"
  },
  {
    title: "Northline Commercial Block",
    location: "Hebbal, Bengaluru",
    type: "Building Construction",
    status: "Completed",
    metric: "42,000 sqft"
  },
  {
    title: "Civic Drainage Package",
    location: "Mysuru Road",
    type: "Civil Contracting",
    status: "Completed",
    metric: "2.4 km"
  },
  {
    title: "Urban Villa Renovation",
    location: "Indiranagar, Bengaluru",
    type: "Renovation",
    status: "Completed",
    metric: "5 months"
  }
] as const;

export const testimonials = [
  {
    name: "Rohan Mehta",
    role: "Home Owner",
    quote:
      "The team gave us transparent project updates and handled site coordination with real discipline."
  },
  {
    name: "Ananya Rao",
    role: "Commercial Client",
    quote:
      "Their planning and execution made a complex building project feel controlled from start to finish."
  },
  {
    name: "Vikram Nair",
    role: "Renovation Customer",
    quote:
      "Clear budget tracking, neat finishing, and reliable site supervision throughout the renovation."
  }
] as const;

export const team = [
  { name: "Aarav Sharma", role: "Managing Director" },
  { name: "Meera Iyer", role: "Senior Site Engineer" },
  { name: "Kabir Menon", role: "Project Manager" },
  { name: "Nisha Kapoor", role: "Client Relations" }
] as const;

export const stats = [
  { label: "Projects Delivered", value: "180+" },
  { label: "Years Experience", value: "15+" },
  { label: "Site Engineers", value: "24" },
  { label: "On-Time Delivery", value: "96%" }
] as const;
