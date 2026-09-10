const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./src/models/User');
const Department = require('./src/models/Department');
const Complaint = require('./src/models/Complaint');
const ComplaintHistory = require('./src/models/ComplaintHistory');
const Comment = require('./src/models/Comment');
const Notification = require('./src/models/Notification');
const Verification = require('./src/models/Verification');

const { calculatePriority } = require('./src/services/priorityService');
const { calculateSlaDeadline } = require('./src/services/slaService');

const categories = [
  'Potholes & Roads',
  'Streetlights',
  'Garbage & Sanitation',
  'Water Leakage',
  'Drainage & Waterlogging',
  'Fallen Trees',
  'Traffic Signals',
  'Public Infrastructure',
  'Electrical Hazards',
  'Other'
];

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicpulse';
    console.log(`[Seed] Connecting to ${connStr}...`);
    await mongoose.connect(connStr);

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Complaint.deleteMany({});
    await ComplaintHistory.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await Verification.deleteMany({});

    console.log('[Seed] Creating Departments...');
    const depts = await Department.create([
      { name: 'Public Works & Roads', code: 'PW-DEPT', description: 'Road maintenance, potholes, and structural repairs.', responsibleCategories: ['Potholes & Roads', 'Public Infrastructure'] },
      { name: 'Electrical & Power Grid', code: 'ELEC-DEPT', description: 'Streetlights, power transformers, and electrical hazards.', responsibleCategories: ['Streetlights', 'Electrical Hazards'] },
      { name: 'Sanitation & Solid Waste', code: 'SAN-DEPT', description: 'Garbage accumulation, recycling, and street cleaning.', responsibleCategories: ['Garbage & Sanitation'] },
      { name: 'Water & Sewerage Board', code: 'WATER-DEPT', description: 'Pipe leaks, drainage overflows, and storm drains.', responsibleCategories: ['Water Leakage', 'Drainage & Waterlogging'] },
      { name: 'Urban Forestry & Parks', code: 'ENV-DEPT', description: 'Fallen trees, green cover, and park maintenance.', responsibleCategories: ['Fallen Trees'] },
      { name: 'Traffic & Urban Mobility', code: 'TRANS-DEPT', description: 'Traffic signals, signage, and pedestrian safety.', responsibleCategories: ['Traffic Signals'] }
    ]);

    const pwDept = depts[0];
    const elecDept = depts[1];
    const sanDept = depts[2];
    const waterDept = depts[3];

    console.log('[Seed] Creating Users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      name: 'Dr. Evelyn Vance (Admin)',
      email: 'admin@civicpulse.city',
      password: 'password123', // Will be hashed via pre-save or override
      phone: '+1 (800) 555-0199',
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
    });

    const officerPW = await User.create({
      name: 'Cmdr. Marcus Sterling',
      email: 'officer@civicpulse.city',
      password: 'password123',
      phone: '+1 (800) 555-0122',
      role: 'officer',
      department: pwDept._id,
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'
    });

    const workerJohn = await User.create({
      name: 'Jack K. - Field Engineer #04',
      email: 'worker@civicpulse.city',
      password: 'password123',
      phone: '+1 (800) 555-0144',
      role: 'worker',
      department: pwDept._id,
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'
    });

    const workerSarah = await User.create({
      name: 'Sarah Chen - Power Grid Tech',
      email: 'sarah.worker@civicpulse.city',
      password: 'password123',
      phone: '+1 (800) 555-0177',
      role: 'worker',
      department: elecDept._id,
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
    });

    const citizenAlice = await User.create({
      name: 'Alice Mercer',
      email: 'citizen@civicpulse.city',
      password: 'password123',
      phone: '+1 (800) 555-0188',
      role: 'citizen',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
    });

    const citizenDavid = await User.create({
      name: 'David Miller',
      email: 'david@civicpulse.city',
      password: 'password123',
      phone: '+1 (800) 555-0155',
      role: 'citizen'
    });

    console.log('[Seed] Generating 32 Realistic Complaints...');

    const sampleLocations = [
      { lat: 12.9716, lng: 77.5946, addr: 'MG Road Metro Station Area, Sector 4' },
      { lat: 12.9352, lng: 77.6245, addr: 'Koramangala 5th Block Main Junction' },
      { lat: 12.9784, lng: 77.6408, addr: 'Indiranagar 100ft Road, Cyber Corridor' },
      { lat: 12.9250, lng: 77.5897, addr: 'Jayanagar 4th Block Market Street' },
      { lat: 12.9698, lng: 77.7500, addr: 'Whitefield IT Park Tech Boulevard' },
      { lat: 13.0358, lng: 77.5970, addr: 'Hebbal Flyover Junction North' },
      { lat: 12.9166, lng: 77.6101, addr: 'BTM Layout 2nd Stage Ring Road' },
      { lat: 12.9610, lng: 77.6387, addr: 'Domlur Intermediate Ring Road' }
    ];

    const complaintTemplates = [
      { title: 'Severe Asphalt Cave-in & Deep Pothole', cat: 'Potholes & Roads', sev: 'critical', desc: 'A massive 4ft deep asphalt collapse causing major traffic hazard and vehicle tire damage.', dept: pwDept._id },
      { title: 'High Voltage Sparking Streetlight Pole', cat: 'Electrical Hazards', sev: 'critical', desc: 'Live electrical wires exposed on pole #E-204 with active sparking near pedestrian crossing.', dept: elecDept._id },
      { title: 'Main Water Supply Pipeline Burst', cat: 'Water Leakage', sev: 'high', desc: 'Clean drinking water gushing onto the main road causing street flooding and low pressure.', dept: waterDept._id },
      { title: 'Garbage Heap Blocking Pedestrian Path', cat: 'Garbage & Sanitation', sev: 'medium', desc: 'Uncollected commercial waste accumulating for 4 days creating foul odor and bio-hazard.', dept: sanDept._id },
      { title: 'Storm Drain Overflow & Sewage Backup', cat: 'Drainage & Waterlogging', sev: 'high', desc: 'Clogged drainage grates overflowing onto residential sidewalk during heavy rainfall.', dept: waterDept._id },
      { title: 'Fallen Banyan Tree Blocking Lane', cat: 'Fallen Trees', sev: 'high', desc: 'Storm uprooted a large tree branch blocking 2 lanes of traffic near public hospital.', dept: depts[4]._id },
      { title: 'Malfunctioning Smart Traffic Light Signal', cat: 'Traffic Signals', sev: 'medium', desc: 'Traffic light stuck on constant red causing gridlock during morning rush hour.', dept: depts[5]._id },
      { title: 'Broken Concrete Bench at Civic Park', cat: 'Public Infrastructure', sev: 'low', desc: 'Vandalized bench with sharp exposed rebar in children playground section.', dept: pwDept._id }
    ];

    const statuses = ['submitted', 'under_review', 'verified', 'assigned', 'in_progress', 'resolved', 'citizen_verification', 'closed', 'reopened'];

    const complaintsToInsert = [];

    for (let i = 0; i < 32; i++) {
      const template = complaintTemplates[i % complaintTemplates.length];
      const loc = sampleLocations[i % sampleLocations.length];
      
      // Slight coordinate jitter
      const latJitter = loc.lat + (Math.random() - 0.5) * 0.04;
      const lngJitter = loc.lng + (Math.random() - 0.5) * 0.04;

      const status = statuses[i % statuses.length];
      const supportCount = Math.floor(Math.random() * 18) + 1;
      const createdDate = new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000));

      const priorityInfo = calculatePriority({
        severity: template.sev,
        category: template.cat,
        supportCount,
        createdAt: createdDate,
        locationRisk: Math.floor(Math.random() * 4) + 6
      });

      const slaDeadline = calculateSlaDeadline(priorityInfo.label, createdDate);

      const photosList = [
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80'
      ];

      const resolutionData = (status === 'resolved' || status === 'closed' || status === 'citizen_verification') ? {
        description: 'Field team deployed. Asphalt resurfacing and structural repair complete.',
        photos: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80'],
        resolvedAt: new Date(createdDate.getTime() + 24 * 60 * 60 * 1000),
        workerNotes: 'Quality audit passed. Surface smoothed.'
      } : { description: '', photos: [], resolvedAt: null, workerNotes: '' };

      complaintsToInsert.push({
        complaintId: `CP-${2026}-${String(i + 101).padStart(5, '0')}`,
        title: `${template.title} #${i + 1}`,
        description: `${template.desc} Reported near ${loc.addr}. Immediate municipal intervention requested.`,
        category: template.cat,
        severity: template.sev,
        priorityScore: priorityInfo.score,
        priority: priorityInfo.label,
        priorityBreakdown: priorityInfo.breakdown,
        location: {
          type: 'Point',
          coordinates: [lngJitter, latJitter]
        },
        address: `${loc.addr} (Grid Zone ${i + 1})`,
        photos: [photosList[i % photosList.length]],
        reporter: i % 2 === 0 ? citizenAlice._id : citizenDavid._id,
        department: template.dept,
        assignedWorker: ['assigned', 'in_progress', 'resolved', 'citizen_verification', 'closed'].includes(status) ? (i % 2 === 0 ? workerJohn._id : workerSarah._id) : null,
        status,
        supportCount,
        supporters: [citizenAlice._id, citizenDavid._id],
        slaDeadline,
        slaStatus: (new Date() > slaDeadline && !['resolved', 'closed'].includes(status)) ? 'breached' : 'within_sla',
        resolution: resolutionData,
        createdAt: createdDate,
        updatedAt: new Date()
      });
    }

    const createdComplaints = await Complaint.create(complaintsToInsert);

    console.log('[Seed] Creating Complaint History Audit Logs & Notifications...');
    for (const comp of createdComplaints) {
      await ComplaintHistory.create({
        complaint: comp._id,
        previousStatus: 'NEW',
        newStatus: 'submitted',
        changedBy: comp.reporter,
        comment: 'Initial issue report submitted via CivicPulse Mobile HUD.',
        timestamp: comp.createdAt
      });

      if (comp.status !== 'submitted') {
        await ComplaintHistory.create({
          complaint: comp._id,
          previousStatus: 'submitted',
          newStatus: comp.status,
          changedBy: officerPW._id,
          comment: `Workflow advanced to ${comp.status}`,
          timestamp: new Date(comp.createdAt.getTime() + 2 * 3600 * 1000)
        });
      }

      await Notification.create({
        user: comp.reporter,
        complaint: comp._id,
        type: 'SUBMITTED',
        message: `Issue ${comp.complaintId} registered. Priority score: ${comp.priorityScore}/100.`,
        read: Math.random() > 0.5,
        createdAt: comp.createdAt
      });

      await Comment.create({
        complaint: comp._id,
        user: officerPW._id,
        text: `Officer Review: Dispatched inspection team. SLA deadline set for ${comp.slaDeadline.toLocaleDateString()}.`
      });
    }

    console.log(`
 ╔════════════════════════════════════════════════════════════╗
 ║  ◈ CIVICPULSE SEED COMPLETE!                               ║
 ║  --------------------------------------------------------  ║
 ║  Departments: 6                                            ║
 ║  Users:       6 (Admin, Officer, 2 Workers, 2 Citizens)   ║
 ║  Complaints:  32 populated complaints                      ║
 ║                                                            ║
 ║  DEMO CREDENTIALS (Password: password123):                ║
 ║  - Citizen:  citizen@civicpulse.city                       ║
 ║  - Worker:   worker@civicpulse.city                        ║
 ║  - Officer:  officer@civicpulse.city                       ║
 ║  - Admin:    admin@civicpulse.city                         ║
 ╚════════════════════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
