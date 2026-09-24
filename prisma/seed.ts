import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Settings singleton
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      businessName: "Selecta Event",
      djName: "Selecta",
      logoUrl: "/brand/selecta-logo.png",
      heroHeading: "Selecta Event",
      heroSubheading: "Premium DJ & Event Experiences",
      heroDescription:
        "Nightclubs. Weddings. Private and corporate events. Selecta Event brings a premium sound, lighting, and hosting experience to every occasion.",
      bio: "With years behind the decks at nightclubs, weddings, and private celebrations, Selecta Event delivers a reading of the room that keeps every crowd moving — from the first dance to the last song of the night.",
      showEvents: false,
      requireSignedContract: false,
    },
  });

  // Admin user
  const email = process.env.ADMIN_EMAIL || "dj@selectaevent.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.adminUser.create({
      data: { name: "Selecta", email, passwordHash },
    });
    console.log(`Admin user created: ${email}`);
  }

  // Services
  const services = [
    {
      name: "Wedding DJ",
      description:
        "Ceremony, cocktail hour, and reception coverage with seamless transitions, MC hosting, and a reading of the room that keeps every generation on the floor.",
      startingPriceCents: 150000,
      sortOrder: 1,
    },
    {
      name: "Nightclub DJ",
      description:
        "High-energy club sets built for peak-time crowds, guest lists, and venues that expect a professional behind the booth.",
      startingPriceCents: 80000,
      sortOrder: 2,
    },
    {
      name: "Birthday Parties",
      description:
        "Milestone birthdays and celebrations with a curated soundtrack for every age group in the room.",
      startingPriceCents: 60000,
      sortOrder: 3,
    },
    {
      name: "Private Events",
      description: "Intimate private functions with a tailored playlist and discreet, professional presence.",
      startingPriceCents: 60000,
      sortOrder: 4,
    },
    {
      name: "Corporate Events",
      description:
        "Product launches, holiday parties, and company milestones with polished sound and professional presentation.",
      startingPriceCents: 90000,
      sortOrder: 5,
    },
    {
      name: "Cultural Events",
      description:
        "Deep catalogue across cultural and community celebrations, holidays, and traditions — respectfully curated, always danceable.",
      startingPriceCents: 90000,
      sortOrder: 6,
    },
    {
      name: "DJ + MC",
      description: "Full hosting and DJ combination — announcements, timeline management, and non-stop music.",
      startingPriceCents: 120000,
      sortOrder: 7,
    },
    {
      name: "Sound System",
      description: "Premium sound reinforcement sized to your venue and guest count.",
      startingPriceCents: 40000,
      sortOrder: 8,
    },
    {
      name: "Lighting",
      description: "Uplighting, dance floor lighting, and ambient design to match the mood of the night.",
      startingPriceCents: 35000,
      sortOrder: 9,
    },
    {
      name: "Custom Event Packages",
      description: "Tell us about your event and we'll build a package around exactly what you need.",
      startingPriceCents: null,
      sortOrder: 10,
    },
  ];

  for (const s of services) {
    const found = await prisma.service.findFirst({ where: { name: s.name } });
    if (!found) await prisma.service.create({ data: s });
  }

  // Contract templates
  const templates = [
    {
      name: "Wedding DJ Agreement",
      body: `This Wedding DJ Agreement ("Agreement") is entered into on {{Contract Date}} between {{Business Name}} ("Provider") and {{Client Name}} ("Client").\n\nEVENT DETAILS\nEvent Type: {{Event Type}}\nEvent Date: {{Event Date}}\nStart Time: {{Start Time}}\nEnd Time: {{End Time}}\nVenue: {{Venue}}\nVenue Address: {{Venue Address}}\nGuest Count: {{Guest Count}}\n\nPAYMENT\nTotal Fee: {{Booking Total}}\nDeposit Required: {{Deposit}}\nAmount Paid: {{Amount Paid}}\nRemaining Balance: {{Remaining Balance}}\n\nTERMS\n1. The Provider agrees to perform DJ services for the Client's wedding event as described above.\n2. A non-refundable deposit is required to secure the date.\n3. The remaining balance is due no later than the event date unless otherwise agreed in writing.\n4. Cancellations within 30 days of the event date forfeit the deposit.\n5. The Provider will arrive with professional equipment and set up in advance of the stated start time.\n6. Any overtime beyond the agreed end time will be billed at the Provider's standard hourly rate.\n\nSigned by: {{DJ Name}} on behalf of {{Business Name}}\nContract Number: {{Contract Number}}`,
    },
    {
      name: "Nightclub Agreement",
      body: `This Nightclub Performance Agreement ("Agreement") is entered into on {{Contract Date}} between {{Business Name}} ("Provider") and {{Client Name}} ("Venue/Client").\n\nEVENT DETAILS\nEvent Date: {{Event Date}}\nStart Time: {{Start Time}}\nEnd Time: {{End Time}}\nVenue: {{Venue}}\nVenue Address: {{Venue Address}}\n\nPAYMENT\nTotal Fee: {{Booking Total}}\nDeposit Required: {{Deposit}}\nRemaining Balance: {{Remaining Balance}}\n\nTERMS\n1. The Provider agrees to perform a DJ set for the duration listed above.\n2. Payment is due in full on the night of performance unless otherwise agreed.\n3. The Venue is responsible for providing a safe, functioning DJ booth and sound system unless the Provider is separately contracted to supply equipment.\n4. Cancellation within 7 days of the event forfeits the deposit.\n\nContract Number: {{Contract Number}}`,
    },
    {
      name: "Private Event Agreement",
      body: `This Private Event Agreement is entered into on {{Contract Date}} between {{Business Name}} and {{Client Name}}.\n\nEVENT DETAILS\nEvent Type: {{Event Type}}\nEvent Date: {{Event Date}}\nStart Time: {{Start Time}} — End Time: {{End Time}}\nVenue: {{Venue}}, {{Venue Address}}\nGuest Count: {{Guest Count}}\n\nPAYMENT\nTotal Fee: {{Booking Total}} | Deposit: {{Deposit}} | Balance Remaining: {{Remaining Balance}}\n\nTERMS\n1. Provider will supply DJ services as described for the private event above.\n2. Deposit secures the date and is non-refundable.\n3. Balance due on or before the event date.\n4. Client is responsible for providing adequate power and space for equipment.\n\nContract Number: {{Contract Number}}`,
    },
    {
      name: "Corporate Event Agreement",
      body: `This Corporate Event Agreement is entered into on {{Contract Date}} between {{Business Name}} and {{Client Name}}.\n\nEVENT DETAILS\nEvent Date: {{Event Date}}\nStart Time: {{Start Time}} — End Time: {{End Time}}\nVenue: {{Venue}}, {{Venue Address}}\n\nPAYMENT\nTotal Fee: {{Booking Total}} | Deposit: {{Deposit}} | Balance Remaining: {{Remaining Balance}}\n\nTERMS\n1. Provider will perform DJ/entertainment services for the corporate event described above.\n2. An invoice or purchase order may be issued alongside this agreement.\n3. Balance due within terms agreed with the client's organization, and no later than the event date unless otherwise specified in writing.\n\nContract Number: {{Contract Number}}`,
    },
    {
      name: "DJ + MC Agreement",
      body: `This DJ + MC Agreement is entered into on {{Contract Date}} between {{Business Name}} and {{Client Name}}.\n\nEVENT DETAILS\nEvent Type: {{Event Type}}\nEvent Date: {{Event Date}}\nStart Time: {{Start Time}} — End Time: {{End Time}}\nVenue: {{Venue}}, {{Venue Address}}\nGuest Count: {{Guest Count}}\n\nSCOPE\nProvider will supply combined DJ and Master of Ceremonies services, including announcements and timeline coordination for the event above.\n\nPAYMENT\nTotal Fee: {{Booking Total}} | Deposit: {{Deposit}} | Balance Remaining: {{Remaining Balance}}\n\nTERMS\n1. Client will provide a run-of-show or timeline at least 7 days prior to the event.\n2. Deposit is non-refundable and secures the date.\n3. Balance due on or before the event date.\n\nContract Number: {{Contract Number}}`,
    },
  ];

  for (const t of templates) {
    const found = await prisma.contractTemplate.findFirst({ where: { name: t.name } });
    if (!found) await prisma.contractTemplate.create({ data: t });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
