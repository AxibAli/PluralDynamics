import azib from "@/assets/azib-ali.png";
// Content sourced from pluraldynamics.com. Items marked PLACEHOLDER need real details from the company.
export const services = [
  { slug: "custom-software", title: "Custom Software Development", featured: true, desc: "Software shaped around how your business actually works — from internal tools to complete platforms.", points: ["Business-specific applications", "Workflow automation", "Internal business tools", "System enhancements"] },
  { slug: "web", title: "Web Development", featured: true, desc: "Fast, responsive websites and web applications that represent your brand and serve your customers.", points: ["Corporate websites", "Web applications", "Business portals", "Website modernization"] },
  { slug: "mobile", title: "Mobile App Development", featured: true, desc: "iOS, Android and cross-platform apps that keep your business in your customers' pockets.", points: ["iOS applications", "Android applications", "Cross-platform apps", "App maintenance"] },
  { slug: "uiux", title: "UI/UX Design", featured: false, desc: "Research, wireframes and interactive prototypes that make products intuitive.", points: ["User research", "Wireframes", "Prototypes", "Interface design"] },
  { slug: "backend", title: "Backend Development", featured: false, desc: "APIs, databases and integrations that keep your systems reliable.", points: ["API development", "Database architecture", "Integrations"] },
  { slug: "graphic", title: "Graphic Design", featured: false, desc: "Brand assets and marketing visuals that communicate clearly.", points: ["Brand assets", "Marketing graphics"] },
  { slug: "seo", title: "Search Engine Optimization", featured: false, desc: "Technical and on-page improvements that help customers find you.", points: ["Technical SEO", "On-page optimization"] },
  { slug: "wordpress", title: "WordPress Development", featured: false, desc: "Custom WordPress sites that are easy for your team to manage.", points: ["Custom themes", "Plugins"] },
  { slug: "cloud", title: "Cloud-Based Software", featured: false, desc: "Cloud-ready applications designed to scale with demand.", points: ["Cloud apps", "Scalability"] },
  { slug: "erp", title: "Enterprise & ERP Solutions", featured: false, desc: "Exclusive ERP systems that bring operations into one place.", points: ["ERP systems", "Enterprise tools"] },
  { slug: "agile", title: "Agile Product Development", featured: false, desc: "Iterative delivery that adapts as your product and market evolve.", points: ["Sprints", "Iteration"] },
  { slug: "desktop", title: "Desktop Software Development", featured: false, desc: "Robust desktop applications for Windows-based business environments.", points: ["Desktop apps"] },
  { slug: "shopify", title: "Shopify & E-commerce", featured: false, desc: "Online stores on Shopify, Magento and WordPress built to convert.", points: ["Stores"] },
  { slug: "marketing", title: "Digital & Social Media Marketing", featured: false, desc: "Social media marketing and management that grows your audience.", points: ["Social media"] },
  { slug: "branding", title: "Branding & Creative Design", featured: false, desc: "Brand identities and creative design that make you memorable.", points: ["Branding"] },
  { slug: "it-support", title: "IT Support Services", featured: false, desc: "Ongoing technical support to keep your systems running smoothly.", points: ["Maintenance", "Support"] },
];

export const process = [
  { n: "01", title: "Discovery & Consultation", desc: "We learn your goals, users and constraints, then define what success looks like." },
  { n: "02", title: "Strategy & Design", desc: "Architecture, wireframes and interface design mapped to your requirements." },
  { n: "03", title: "Development & Delivery", desc: "Agile build cycles with regular demos, testing and transparent progress." },
  { n: "04", title: "Support & Improvement", desc: "Maintenance, monitoring and continuous enhancement after launch." },
];

export const techGroups = [
  { label: "Frontend", items: ["React", "Angular", "HTML5", "CSS3", "Bootstrap", "jQuery", "Kendo UI", "PWA"] },
  { label: "Backend", items: ["C#", "PHP", "Python", "Django", "CodeIgniter", "Perl", "Visual Basic"] },
  { label: "Mobile", items: ["iOS", "Android", "Xamarin"] },
  { label: "CMS & E-commerce", items: ["WordPress", "Magento", "Joomla"] },
  { label: "Databases", items: ["MongoDB", "MySQL"] },
  { label: "Tools", items: ["Visual Studio"] },
];

export const reasons = [
  { title: "Comprehensive Software Development", desc: "From initial wireframing to UI/UX design, development, and ongoing support, we provide complete software solutions customized to your needs." },
  { title: "Agile & Scalable Development Model", desc: "Our adaptable Agile methodology empowers startups and growing businesses, ensuring the best-fit solution for every project." },
  { title: "Efficient & Customizable Processes", desc: "At Plural Dynamics, we implement structured yet flexible workflows, designed to align with industry standards and your specific business goals." },
  { title: "Expert Team with Proven Skills", desc: "Our in-house specialists, led by experienced project managers, bring expertise, dedication, and innovation to every project, delivering top-tier results." },
  { title: "Cost-Effective Software Solutions", desc: "We develop high-performance, low-maintenance applications using cutting-edge technologies, delivering impactful digital experiences users love." },
  { title: "Uncompromised Quality & Security", desc: "By utilizing advanced testing tools and following strict security protocols, we ensure that every product meets industry-best practices before deployment." },
];

export const leader = {
  name: "Muhammad Azib Ali",
  role: "CEO & Founder",
  photo: azib,
};

// Contact details supplied by the client.
export type Office = { city: string; country: string; address: string; phone: string; placeholder?: boolean };
export const contact = {
  email: "official@pluraldynamics.com",
  offices: [
    { city: "Tübingen", country: "Germany", address: "Fichtenweg 13, Tübingen, Germany", phone: "+49 1515 6228596" },
    { city: "Firenze", country: "Italy", address: "Via di Quarto 1, Firenze, Italy", phone: "+39 344 658 0188" },
    { city: "Karachi", country: "Pakistan", address: "H-3115 King Cottages, Gulistan-e-Johar Block 7, Karachi, Pakistan", phone: "+92 331 3006368" },
  ] satisfies Office[],
};

/** "+39 344 658 0188" -> "tel:+393446580188" */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export type Product = { slug: string; name: string; tagline: string; summary: string; intro?: string; features: { title: string; desc: string; points: string[] }[] };
export const products: Product[] = [
  {
    slug: "gymflex", name: "GymFlex", tagline: "Complete gym management",
    summary: "An all-in-one, scalable Gym Management System for gyms, fitness centers and health clubs of all sizes — automating enrollment, scheduling, billing and progress tracking.",
    intro: "GymFlex is a modern, cloud-based Gym Management System crafted for fitness businesses. From the moment a new member signs up to tracking their progress over time, it gives owners, staff and members a seamless experience — with a user-friendly design that non-technical users can manage with ease.",
    features: [
      { title: "Member Management", desc: "Streamline the entire member lifecycle — from registration to renewals.", points: ["Online and in-person enrollment", "Membership tracking & renewal reminders", "Detailed member insights"] },
      { title: "Automated Billing", desc: "A comprehensive payment management system that removes billing hassles.", points: ["Recurring payments", "Automatic invoicing", "Cards, bank transfers & wallets"] },
      { title: "Class & Session Scheduling", desc: "Optimize group classes and personal training sessions.", points: ["Dynamic scheduling", "Member booking & cancellations", "Calendar integration"] },
      { title: "Performance Tracking", desc: "Insightful performance data for members and trainers.", points: ["Progress monitoring", "Attendance analytics", "Trainer goal tools"] },
      { title: "Customizable Dashboards", desc: "Role-based dashboards for every user.", points: ["Admins: operations & finance", "Trainers: clients & sessions", "Members: goals, classes & payments"] },
    ],
  },
  {
    slug: "hotelpro", name: "HotelPro", tagline: "Hotel management system",
    summary: "A Hotel Management System that streamlines reservations, billing and guest services for hotels, resorts and serviced apartments — from boutique properties to multi-location chains.",
    intro: "HotelPro is a centralized platform that unifies and automates hotel management processes. With an intuitive interface, real-time updates and cloud-based capabilities, your team can focus on what truly matters: delivering unparalleled hospitality.",
    features: [
      { title: "Reservation Management", desc: "Manage online, direct and group bookings in one centralized system.", points: ["Streamlined bookings", "OTA integration", "Real-time availability"] },
      { title: "Guest Check-In & Check-Out", desc: "Fast, mobile-accessible processes with customizable workflows.", points: ["Fast processes", "Mobile check-in/out", "Custom workflows"] },
      { title: "Billing & Invoicing", desc: "Automated, accurate and tax-compliant financial management.", points: ["Automated & group billing", "Cash, card & digital payments", "Tax compliance"] },
      { title: "Housekeeping & Maintenance", desc: "Assign tasks instantly and track completion in real time.", points: ["Task management", "Service tracking", "Automated alerts"] },
      { title: "Performance Analytics", desc: "Insights on occupancy, revenue and guest feedback.", points: ["Actionable insights", "Custom reports", "Predictive analytics"] },
      { title: "Customizable Dashboard", desc: "Role-based dashboards for staff across every department.", points: ["Quick access to key tools", "Department views"] },
    ],
  },
  { slug: "insitsync", name: "InsitSync", tagline: "Product details coming soon", summary: "Listed in the Plural Dynamics product portfolio. Full product information will be published here soon.", features: [] },
  { slug: "tope", name: "topE", tagline: "Product details coming soon", summary: "Listed in the Plural Dynamics product portfolio. Full product information will be published here soon.", features: [] },
  { slug: "repairbox", name: "Repairbox", tagline: "Product details coming soon", summary: "Listed in the Plural Dynamics product portfolio. Full product information will be published here soon.", features: [] },
  { slug: "noore", name: "Nooré", tagline: "Product details coming soon", summary: "Listed in the Plural Dynamics product portfolio. Full product information will be published here soon.", features: [] },
];

export const expertise = [
  { slug: "custom-software", title: "Customized Software Solutions", desc: "As a leading custom software development firm, we transform groundbreaking ideas into intuitive, high-quality applications that enhance business operations." },
  { slug: "erp", title: "Exclusive ERP Systems", desc: "Our ERP solutions manage finance, HR, procurement, and order processing, simplifying enterprise workflows and maximizing efficiency." },
  { slug: "cloud", title: "Cloud-Based Software Development", desc: "From iOS and Android to cross-platform applications, we build cloud-based mobile solutions that enhance customer engagement and drive business growth." },
  { slug: "outsourcing", title: "Global Software Outsourcing", desc: "Partnering with skilled developers allows businesses to cut costs, reduce operational burdens, and execute IT projects seamlessly." },
  { slug: "wordpress", title: "WordPress Development Solutions", desc: "We design high-quality, scalable WordPress websites that deliver real value, combining functionality with aesthetic excellence." },
];

export const industries = [
  { slug: "real-estate", title: "Real Estate and Home Improvement", desc: "Plural Dynamics offers scalable enterprise solutions for the real estate and home improvement industries. Our custom-built software optimizes logistics, enhances operational efficiency, and streamlines business dynamics within these sectors." },
  { slug: "travel", title: "Travel & Hospitality", desc: "Plural Dynamics has partnered with various clients to develop comprehensive software solutions for onsite, mobile, web, and cloud-based platforms. Our expertise extends to hospitality management and real-time booking platforms, working alongside industry leaders to enhance customer experiences." },
  { slug: "healthcare", title: "Healthcare and Life Sciences", desc: "We create innovative healthcare solutions that automate processes, improve accessibility, and enhance the quality of medical services. Our expertise includes CRM/ERP solutions designed for medical organizations, healthcare service providers, and patient care." },
  { slug: "media", title: "Media and Entertainment", desc: "As a trusted technology partner for leading media and entertainment companies, we bring extensive experience and a diverse talent pool to meet the evolving demands of modern businesses." },
  { slug: "finance", title: "Finance", desc: "We collaborate with financial and banking institutions to develop scalable software systems and deliver innovative solutions that drive tangible business value." },
  { slug: "retail", title: "Retail", desc: "We develop retail software solutions that empower businesses with predictive customer analytics, advanced inventory management, marketing automation, retail accounting software, SIEM integration, and seamless connectivity with third-party services and social media platforms." },
];

export const techServices = ["React Development", ".NET Core", "Node.js", ".NET Development", "Hybrid App Development", "iOS Development", "Android Development", "Xamarin Development"];

export const coreValues = [
  { title: "Innovation", desc: "We stay ahead of trends, using advanced technology to deliver future-proof solutions for our clients." },
  { title: "Excellence", desc: "We are committed to providing quality work that not only meets the requirements of our clients but exceeds their expectations." },
  { title: "Integrity", desc: "We believe in honest, transparent communication and building trust with every client." },
  { title: "Collaboration", desc: "Your goals are our goals. We work side by side with you, ensuring that every solution is specialized to your unique needs." },
];

export const team = [
  { name: "Muhammad Azib Ali", role: "CEO & Founder", bio: "Muhammad Azib envisions innovation and excellence. He leads our team in the most dedicated and strategic way toward the goal." },
  { name: "Tayyab Irfan", role: "COO", bio: "Tayyab ensures the smooth running and proper functioning of all operations and brings vast experience in managing organizations." },
  { name: "Waqas Qazi", role: "CTO", bio: "Waqas brings unique expertise in software development and a passion for technology to drive our technical strategies and solutions." },
];

export const teamIntro = "Meet the masterminds behind Plural Dynamics. We have a blend of different talented professionals from various walks of life who bring together their experience and expertise to make Plural dynamics stand out. Whether developers, designers, thinkers, or strategists, learn more about who makes up Plural Dynamics.";
export const teamLeads = [
  { area: "React", name: "Waqas Qazi" },
  { area: "Content Writing (CW)", name: "Qurat-ul-Ain" },
  { area: "Human Resources", name: "Iqra Patel" },
  { area: "DOT NET", name: "Syed Muhammad Owais" },
];
// Original homepage "Built With" list, in the original order.
export const techList = ["C Sharp", "Visual Studio", "React", "PWA", "Kendo UI", "Xamarin", "WordPress", "PHP", "HTML 5", "CSS 3", "Magento", "Joomla", "Perl", "Visual Basic", "Bootstrap", "Angular", "Django", "CodeIgniter", "MongoDB", "iOS", "Python", "MySQL", "Android", "jQuery"];
export const featuredServices = ["Graphic Design", "UI/UX Design", "SEO", "Mobile App Development", "Backend Development", "Web Development"];
export const projectTypes = ["Graphic Design", "UI/UX Design", "SEO", "Mobile Development", "Backend Development", "Web Development", "Other"];

// PLACEHOLDER: plan names and prices are from the original site; descriptions and feature lists need confirmation from the company.
export const pricingPlans = [
  {
    name: "Small Business", price: "50", hot: false, desc: "For startups and small teams launching or improving a focused product.",
    features: ["Dedicated developer", "UI/UX design support", "Responsive web or mobile build", "Weekly progress reports", "Email support", "1 month post-launch maintenance"],
  },
  {
    name: "Corporate Plan", price: "100", hot: true, desc: "For growing companies that need a full team and enterprise-grade delivery.",
    features: ["Dedicated project manager", "Full-stack development team", "Custom software, ERP & cloud", "QA testing & security review", "Priority support", "3 months post-launch maintenance"],
  },
];
