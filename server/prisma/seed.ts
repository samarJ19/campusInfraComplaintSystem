import {
  Role,
  Department,
  ComplaintStatus,
  Priority,
  ValidityStatus,
  NotificationType,
  ActivityAction,
  ReassignmentStatus,
} from "../generated/prisma/client";
import * as bcrypt from "bcrypt";

import { prismaClient as prisma } from "../prisma/client";

// ==========================================
// 1. MOCK DATA ARRAYS (Realistic & No Placeholders)
// ==========================================

const studentNames = [
  "Aarav Patel",
  "Diya Sharma",
  "Rohan Gupta",
  "Isha Singh",
  "Kabir Verma",
  "Ananya Desai",
  "Aditya Reddy",
  "Meera Nair",
  "Arjun Rao",
  "Pooja Joshi",
  "Vikram Malhotra",
  "Sneha Kapoor",
  "Karan Das",
  "Neha Menon",
  "Rahul Bose",
  "Kriti Iyer",
  "Samir Mehta",
  "Riya Bhatia",
  "Dev Anand",
  "Tanya Chawla",
];

const facultyNames = [
  "Dr. Anil Kulkarni",
  "Prof. Sunita Agarwal",
  "Dr. Rajesh Khanna",
];

const maintenanceNames = [
  "Ramesh Kumar",
  "Suresh Yadav",
  "Dinesh Paswan",
  "Babu Rao",
  "Mukesh Singh",
  "Hari Prasad",
  "Gopal Krishnan",
  "Shyam Sundar",
];

const adminName = "System Administrator";

// Mapped realistic complaints by department
const complaintTemplates = {
  [Department.ELECTRICAL]: [
    {
      title: "Power outage in Block B",
      description:
        "The entire second floor of Block B has no electricity since 2 hours.",
      priority: Priority.HIGH,
    },
    {
      title: "Sparking switchboard in Room 102",
      description:
        "Switchboard near the entrance is sparking when turning on the fan. Needs immediate attention.",
      priority: Priority.HIGH,
    },
    {
      title: "Broken tube light in Library",
      description:
        "The tube light in the silent reading section is flickering constantly and causing headaches.",
      priority: Priority.LOW,
    },
    {
      title: "AC not cooling in Seminar Hall",
      description: "The main AC in the seminar hall is blowing warm air.",
      priority: Priority.MEDIUM,
    },
  ],
  [Department.WATER]: [
    {
      title: "Leaking pipe in Boys Hostel",
      description:
        "Water is continuously leaking from the main pipe in the 3rd-floor washroom.",
      priority: Priority.HIGH,
    },
    {
      title: "No drinking water in Canteen",
      description:
        "The RO water purifier in the canteen is empty and the inlet valve seems blocked.",
      priority: Priority.MEDIUM,
    },
    {
      title: "Clogged drain in Lab 4",
      description:
        "The sink in the chemistry lab is clogged and water is overflowing.",
      priority: Priority.MEDIUM,
    },
    {
      title: "Foul smell from tap water",
      description:
        "The tap water in Block A washrooms has a strange yellow tint and foul smell.",
      priority: Priority.HIGH,
    },
  ],
  [Department.SANITIZATION]: [
    {
      title: "Dustbins overflowing in IT Block",
      description:
        "Garbage hasn't been collected from the IT block corridors for two days.",
      priority: Priority.MEDIUM,
    },
    {
      title: "Washroom needs urgent cleaning",
      description:
        "Ground floor washroom in the main building is extremely dirty and lacks hand wash.",
      priority: Priority.HIGH,
    },
    {
      title: "Pest issue in the cafeteria",
      description: "Spotted rodents near the storage area of the cafeteria.",
      priority: Priority.HIGH,
    },
    {
      title: "Corridor floor sticky",
      description:
        "Someone spilled a sugary drink on the second-floor corridor, it needs mopping.",
      priority: Priority.LOW,
    },
  ],
  [Department.INTERNET]: [
    {
      title: "Wi-Fi dropping in Girls Hostel",
      description:
        "The hostel Wi-Fi disconnects every 10 minutes. Extremely unstable.",
      priority: Priority.HIGH,
    },
    {
      title: "LAN port damaged in Library",
      description:
        "Desk 14 LAN port is physically broken and the cable won't snap in.",
      priority: Priority.LOW,
    },
    {
      title: "Router completely dead in Block C",
      description:
        "The access point on the first floor has no power lights on.",
      priority: Priority.MEDIUM,
    },
    {
      title: "Extremely slow speeds in Lab 2",
      description:
        "Getting less than 1Mbps speed on all systems in the Computer Networks lab.",
      priority: Priority.MEDIUM,
    },
  ],
  [Department.INFRASTRUCTURE]: [
    {
      title: "Broken window pane in Room 304",
      description:
        "A cricket ball shattered the window pane. Glass is on the floor.",
      priority: Priority.HIGH,
    },
    {
      title: "Loose ceiling tile",
      description:
        "A ceiling tile in the main auditorium looks like it's about to fall.",
      priority: Priority.HIGH,
    },
    {
      title: "Door hinge broken",
      description:
        "The back door to the chemistry lab won't close properly because the bottom hinge is snapped.",
      priority: Priority.MEDIUM,
    },
    {
      title: "Desks need repair",
      description:
        "Three desks in the back row of room 201 have broken writing pads.",
      priority: Priority.LOW,
    },
  ],
  [Department.GENERAL]: [
    {
      title: "Stray dogs near the parking lot",
      description:
        "A pack of stray dogs is acting aggressive near the two-wheeler parking.",
      priority: Priority.HIGH,
    },
    {
      title: "Loud construction noise during exams",
      description:
        "Construction work near the library is extremely loud and disruptive.",
      priority: Priority.MEDIUM,
    },
    {
      title: "Overgrown bushes near pathway",
      description:
        "The pathway from the hostel to the main gate has overgrown thorny bushes.",
      priority: Priority.LOW,
    },
    {
      title: "Missing signage for emergency exits",
      description:
        "The new annex building lacks proper emergency exit signs on the ground floor.",
      priority: Priority.MEDIUM,
    },
  ],
};

const realisticComments = [
  "I have checked this, it looks worse than described.",
  "When can we expect this to be resolved?",
  "I have informed the head technician.",
  "Waiting for spare parts to arrive.",
  "Can you please provide an alternate solution temporarily?",
  "This is causing a lot of inconvenience to the students.",
  "Work has started, will be fixed by evening.",
  "Please prioritize this, it is a safety hazard.",
  "Thank you for the prompt response.",
  "The issue reoccurred today morning.",
];

const reassignmentReasons = [
  "I am currently on leave for the next 3 days.",
  "This requires specialized equipment I don't have.",
  "I am overloaded with 5 other high-priority tasks.",
  "This falls under civil work, not electrical.",
  "Night shift technician needs to handle this as power shutdown is required.",
];

// ==========================================
// 2. UTILITY FUNCTIONS
// ==========================================

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randomBool = (probability = 0.5) => Math.random() < probability;

// Generates a random date within the last 30 days
const generateRandomPastDate = (daysAgoMin = 0, daysAgoMax = 30): Date => {
  const now = new Date();
  const date = new Date(
    now.getTime() -
      randomInt(
        daysAgoMin * 24 * 60 * 60 * 1000,
        daysAgoMax * 24 * 60 * 60 * 1000,
      ),
  );
  // Randomize hour and minute to look realistic
  date.setHours(randomInt(8, 18), randomInt(0, 59));
  return date;
};

// Generates a sequential timeline for a complaint lifecycle
const generateTimeline = (startDate: Date, steps: number): Date[] => {
  const timeline = [startDate];
  let currentDate = new Date(startDate);

  for (let i = 1; i < steps; i++) {
    // Add between 2 and 48 hours for each step
    const addedTime = randomInt(2 * 60 * 60 * 1000, 48 * 60 * 60 * 1000);
    currentDate = new Date(currentDate.getTime() + addedTime);
    // Ensure we don't go into the future
    if (currentDate > new Date())
      currentDate = new Date(Date.now() - 1000 * 60 * 30);
    timeline.push(new Date(currentDate));
  }
  return timeline;
};

// ==========================================
// 3. MAIN SEED FUNCTION
// ==========================================

async function main() {
  console.log("🌱 Starting database seed...");

  // --- CLEANUP ---
  console.log("🧹 Cleaning up old data...");
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.reassignmentRequest.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.user.deleteMany();

  // --- PASSWORD HASHING ---
  const defaultPassword = await bcrypt.hash("Password@123", 10);

  // --- CREATE USERS ---
  console.log("👥 Creating Users...");

  // 1 Admin
  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: "admin@college.edu",
      password: defaultPassword,
      role: Role.ADMIN,
    },
  });

  // 3 Faculty
  const facultyUsers = [];
  for (let i = 0; i < 3; i++) {
    const faculty = await prisma.user.create({
      data: {
        name: facultyNames[i],
        email: `faculty${i + 1}@college.edu`,
        password: defaultPassword,
        role: Role.FACULTY,
        department: [
          Department.GENERAL,
          Department.INFRASTRUCTURE,
          Department.ELECTRICAL,
        ][i],
      },
    });
    facultyUsers.push(faculty);
  }

  // 8 Maintenance Staff (Spread across departments)
  const departments = Object.values(Department);
  const maintenanceUsers = [];
  for (let i = 0; i < 8; i++) {
    const staff = await prisma.user.create({
      data: {
        name: maintenanceNames[i],
        email: `maintenance${i + 1}@college.edu`,
        password: defaultPassword,
        role: Role.MAINTENANCE,
        department: departments[i % departments.length],
      },
    });
    maintenanceUsers.push(staff);
  }

  // 20 Students
  const studentUsers = [];
  for (let i = 0; i < 20; i++) {
    const year = randomInt(2020, 2024);
    const idStr = (i + 1).toString().padStart(3, "0");
    const student = await prisma.user.create({
      data: {
        name: studentNames[i],
        email: `student${i + 1}@college.edu`,
        password: defaultPassword,
        role: Role.STUDENT,
        enrollmentNumber: `EN${year}${idStr}`,
      },
    });
    studentUsers.push(student);
  }

  console.log(`✅ Created 1 Admin, 3 Faculty, 8 Maintenance, 20 Students.`);

  // --- CREATE COMPLAINTS & LIFECYCLE ---
  console.log(
    "📝 Generating 50 Realistic Complaints with Activity Logs & Notifications...",
  );

  const complaints = [];
  const allLogs: any[] = [];
  const allNotifications: any[] = [];

  // Distribution Target: 50 total
  // 5 Pending, 5 Approved, 10 Assigned, 10 In Progress, 15 Resolved, 5 Reassignment Requested
  const statusDistribution = [
    ...Array(5).fill(ComplaintStatus.PENDING_APPROVAL),
    ...Array(5).fill(ComplaintStatus.APPROVED),
    ...Array(10).fill(ComplaintStatus.ASSIGNED),
    ...Array(10).fill(ComplaintStatus.IN_PROGRESS),
    ...Array(15).fill(ComplaintStatus.RESOLVED),
    ...Array(5).fill(ComplaintStatus.REASSIGNMENT_REQUESTED),
  ];

  for (let i = 0; i < 50; i++) {
    const student = randomElement(studentUsers);
    const targetStatus = statusDistribution[i];
    const department = randomElement(departments);
    const template = randomElement(complaintTemplates[department]);

    // Determine lifecycle steps based on target status
    let steps = 1;
    if (targetStatus === ComplaintStatus.APPROVED) steps = 2;
    if (targetStatus === ComplaintStatus.ASSIGNED) steps = 3;
    if (targetStatus === ComplaintStatus.IN_PROGRESS) steps = 4;
    if (targetStatus === ComplaintStatus.RESOLVED) steps = 5;
    if (targetStatus === ComplaintStatus.REASSIGNMENT_REQUESTED) steps = 4; // Created -> Approved -> Assigned -> Reassignment Requested

    const startDate = generateRandomPastDate(5, 30);
    const timeline = generateTimeline(startDate, steps);

    // Prepare relationships
    const facultyReviewer = steps >= 2 ? randomElement(facultyUsers) : null;

    // Find maintenance staff matching department if possible, else random
    let assignedStaff = null;
    if (steps >= 3) {
      const deptStaff = maintenanceUsers.filter(
        (u) => u.department === department,
      );
      assignedStaff =
        deptStaff.length > 0
          ? randomElement(deptStaff)
          : randomElement(maintenanceUsers);
    }

    // Determine validity
    const validityStatus =
      steps >= 2 ? ValidityStatus.VALID : ValidityStatus.PENDING;
    const reviewedAt = steps >= 2 ? timeline[1] : null;
    const resolvedAt =
      targetStatus === ComplaintStatus.RESOLVED
        ? timeline[timeline.length - 1]
        : null;

    // Create Complaint
    const complaint = await prisma.complaint.create({
      data: {
        title: template.title,
        description: template.description,
        category: department,
        priority: template.priority,
        status: targetStatus,
        validityStatus,
        feedbackRating:
          targetStatus === ComplaintStatus.RESOLVED ? randomInt(3, 5) : null,
        feedbackComment:
          targetStatus === ComplaintStatus.RESOLVED && randomBool()
            ? "Good job, fixed on time."
            : null,
        createdAt: timeline[0],
        updatedAt: timeline[timeline.length - 1],
        reviewedAt,
        resolvedAt,
        createdById: student.id,
        reviewedById: facultyReviewer?.id,
        assignedToId: assignedStaff?.id,
      },
    });
    complaints.push(complaint);

    // Generate Lifecycle Logs and Notifications

    // STEP 1: CREATED
    allLogs.push({
      action: ActivityAction.COMPLAINT_CREATED,
      description: `Complaint created by ${student.name}`,
      createdAt: timeline[0],
      complaintId: complaint.id,
      actorId: student.id,
    });
    allNotifications.push({
      title: "New Complaint",
      message: `Your complaint "${complaint.title}" has been registered.`,
      type: NotificationType.COMPLAINT_CREATED,
      createdAt: timeline[0],
      userId: student.id,
      complaintId: complaint.id,
      isRead: randomBool(0.8),
    });

    // STEP 2: APPROVED
    if (steps >= 2 && facultyReviewer) {
      allLogs.push({
        action: ActivityAction.COMPLAINT_APPROVED,
        description: `Complaint validated and approved by ${facultyReviewer.name}`,
        createdAt: timeline[1],
        complaintId: complaint.id,
        actorId: facultyReviewer.id,
      });
      allNotifications.push({
        title: "Complaint Approved",
        message: `Your complaint has been reviewed and approved.`,
        type: NotificationType.COMPLAINT_APPROVED,
        createdAt: timeline[1],
        userId: student.id,
        complaintId: complaint.id,
        isRead: randomBool(0.7),
      });
    }

    // STEP 3: ASSIGNED
    if (steps >= 3 && assignedStaff && facultyReviewer) {
      allLogs.push({
        action: ActivityAction.COMPLAINT_ASSIGNED,
        description: `Complaint assigned to ${assignedStaff.name}`,
        createdAt: timeline[2],
        complaintId: complaint.id,
        actorId: facultyReviewer.id,
      });
      allNotifications.push({
        title: "New Assignment",
        message: `You have been assigned a new task: ${complaint.title}`,
        type: NotificationType.COMPLAINT_ASSIGNED,
        createdAt: timeline[2],
        userId: assignedStaff.id,
        complaintId: complaint.id,
        isRead: randomBool(0.9),
      });
    }

    // STEP 4: IN PROGRESS / REASSIGNMENT REQUESTED
    if (steps >= 4 && assignedStaff) {
      if (targetStatus === ComplaintStatus.REASSIGNMENT_REQUESTED) {
        allLogs.push({
          action: ActivityAction.REASSIGNMENT_REQUESTED,
          description: `${assignedStaff.name} requested reassignment.`,
          createdAt: timeline[3],
          complaintId: complaint.id,
          actorId: assignedStaff.id,
        });
        // We will create the actual Request entry in the next section
      } else {
        allLogs.push({
          action: ActivityAction.IN_PROGRESS,
          description: `Work started by ${assignedStaff.name}`,
          createdAt: timeline[3],
          complaintId: complaint.id,
          actorId: assignedStaff.id,
        });
        allNotifications.push({
          title: "Work Started",
          message: `Maintenance staff has started working on your issue.`,
          type: NotificationType.COMPLAINT_IN_PROGRESS,
          createdAt: timeline[3],
          userId: student.id,
          complaintId: complaint.id,
          isRead: randomBool(0.6),
        });
      }
    }

    // STEP 5: RESOLVED
    if (steps >= 5 && assignedStaff) {
      allLogs.push({
        action: ActivityAction.RESOLVED,
        description: `Issue resolved by ${assignedStaff.name}`,
        createdAt: timeline[4],
        complaintId: complaint.id,
        actorId: assignedStaff.id,
      });
      allNotifications.push({
        title: "Complaint Resolved",
        message: `Your issue has been resolved. Please provide feedback.`,
        type: NotificationType.COMPLAINT_RESOLVED,
        createdAt: timeline[4],
        userId: student.id,
        complaintId: complaint.id,
        isRead: randomBool(0.5),
      });
    }
  }

  // Insert Logs and Notifications
  await prisma.activityLog.createMany({ data: allLogs });
  await prisma.notification.createMany({ data: allNotifications });

  console.log(
    `✅ Generated ${allLogs.length} Activity Logs and ${allNotifications.length} Notifications.`,
  );

  // --- CREATE REASSIGNMENT REQUESTS ---
  console.log("🔄 Creating 5 Reassignment Requests...");
  const reassignmentComplaints = complaints.filter(
    (c) => c.status === ComplaintStatus.REASSIGNMENT_REQUESTED,
  );

  for (const complaint of reassignmentComplaints) {
    if (!complaint.assignedToId) continue;

    await prisma.reassignmentRequest.create({
      data: {
        reason: randomElement(reassignmentReasons),
        status: ReassignmentStatus.PENDING,
        createdAt: new Date(complaint.updatedAt.getTime() - 1000 * 60 * 5), // Just before the last update
        complaintId: complaint.id,
        requestedById: complaint.assignedToId,
      },
    });

    // Notify admin
    await prisma.notification.create({
      data: {
        title: "Reassignment Request",
        message: `Staff requested reassignment for: ${complaint.title}`,
        type: NotificationType.REASSIGNMENT_REQUESTED,
        userId: admin.id,
        complaintId: complaint.id,
      },
    });
  }

  // --- CREATE COMMENTS ---
  console.log("💬 Creating 20 Comments...");
  const activeComplaints = complaints.filter(
    (c) => c.status !== ComplaintStatus.PENDING_APPROVAL,
  );
  const commentsData = [];

  for (let i = 0; i < 20; i++) {
    const complaint = randomElement(activeComplaints);
    // 50/50 chance comment is from student or assigned staff
    const isStudent = randomBool();
    const actorId = isStudent
      ? complaint.createdById
      : complaint.assignedToId || admin.id;

    commentsData.push({
      content: randomElement(realisticComments),
      createdAt: new Date(
        complaint.createdAt.getTime() + randomInt(1, 24) * 60 * 60 * 1000,
      ), // Random time after creation
      complaintId: complaint.id,
      userId: actorId,
    });
  }
  await prisma.comment.createMany({ data: commentsData });

  // Add Comment Activity Logs
  const commentLogs = commentsData.map((c) => ({
    action: ActivityAction.COMMENT_ADDED,
    description: "Added a comment",
    createdAt: c.createdAt,
    complaintId: c.complaintId,
    actorId: c.userId,
  }));
  await prisma.activityLog.createMany({ data: commentLogs });

  // --- UPDATE ACTIVE ASSIGNMENTS ---
  console.log("📊 Updating active assignments count for maintenance staff...");

  const assignmentsGroup = await prisma.complaint.groupBy({
    by: ["assignedToId"],
    where: {
      status: {
        in: [ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS],
      },
      assignedToId: { not: null },
    },
    _count: {
      id: true,
    },
  });

  for (const group of assignmentsGroup) {
    if (group.assignedToId) {
      await prisma.user.update({
        where: { id: group.assignedToId },
        data: { activeAssignments: group._count.id },
      });
    }
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
