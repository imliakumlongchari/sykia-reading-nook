import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  onSnapshot, 
  setDoc,
  serverTimestamp,
  Timestamp,
  deleteField
} from 'firebase/firestore';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Users, 
  History, 
  CheckCircle2, 
  Building2,
  CalendarDays,
  ChevronRight,
  ChevronDown,
  Sun,
  Sunset,
  Sunrise,
  Plus,
  Trash2,
  Search,
  AlertCircle,
  AlertTriangle,
  Edit2,
  Save,
  X,
  Briefcase,
  BookOpen,
  Wrench,
  Info,
  Calendar,
  Hourglass,
  Archive,
  RotateCcw,
  CalendarCheck,
  CalendarRange,
  Lock,
  Unlock,
  KeyRound,
  Filter,
  Settings,
  Mail,
  ShieldCheck,
  TreeDeciduous,
  Timer,
  BarChart3,
  FileText,
  Smile,
  Hand,
  UserMinus,
  UserCheck,
  BellRing,
  Award,
  Download,
  Moon,
  Zap,
  Ban,
  Cake,
  Sofa,
  CreditCard,
  StickyNote,
  Loader2,
  MapPin,
  TrendingUp,
  PartyPopper
} from 'lucide-react';

// --- Firebase Configuration (Safe Init) ---
// --- 1. PASTE YOUR FIREBASE KEYS HERE (For StackBlitz/Deployment) ---
const firebaseConfig = {
  apiKey: "AIzaSyBSXLrR--P6IMCvyzir1QQPhJNfD5a6kcs",
  authDomain: "sykia-reading-nook.firebaseapp.com",
  projectId: "sykia-reading-nook",
  storageBucket: "sykia-reading-nook.firebasestorage.app",
  messagingSenderId: "100174275222",
  appId: "1:100174275222:web:c6cf5e58bfa5d4ac9cd8b7",
  measurementId: "G-XP1YTYF7VE"
};

const initFirebase = () => {
  try {
    // 2. Check if running in Playground Environment (Keep this for the chat preview)
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
      const config = JSON.parse(__firebase_config);
      const app = initializeApp(config);
      return { 
        auth: getAuth(app), 
        db: getFirestore(app),
        appId: typeof __app_id !== 'undefined' ? __app_id : 'default-app-id',
        error: null 
      };
    } 
    // 3. Fallback to Manual Config (For your deployment)
    else if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
       const app = initializeApp(firebaseConfig);
       return {
          auth: getAuth(app),
          db: getFirestore(app),
          appId: "sykia-main",
          error: null
       };
    }
    else {
      return { error: "Firebase config not found. Please paste your keys in the firebaseConfig object." };
    }
  } catch (e) {
    return { error: "Failed to initialize Firebase." };
  }
};

const { auth, db, appId, error: firebaseError } = initFirebase();

// --- CONSTANTS ---
const DEFAULT_PIN = "1234";
const TOTAL_SEATS = 42;

// --- Helper Functions ---
const formatDate = (date) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (e) { return 'Invalid Date'; }
};

const formatDateShort = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch (e) { return ''; }
};

const formatDateForInput = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) { return ''; }
};

const formatDateStringHeader = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch (e) { return dateString; }
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) { return ''; }
};

const getTimeStringFromTimestamp = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (e) { return ''; }
};

const combineDateAndTime = (baseDate, timeStr) => {
  if (!timeStr) return new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(baseDate);
  newDate.setHours(hours);
  newDate.setMinutes(minutes);
  newDate.setSeconds(0);
  return newDate;
};

const getDuration = (start, end) => {
  if (!start || !end) return 0;
  try {
      const startTime = start.toDate ? start.toDate() : new Date(start);
      const endTime = end.toDate ? end.toDate() : new Date(end);
      return Math.max(0, endTime - startTime);
  } catch(e) { return 0; }
};

const formatDurationString = (ms) => {
  if (ms <= 0) return '0m';
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getDaysRemaining = (endDate) => {
  if (!endDate) return null;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch(e) { return null; }
};

const getMemberStatus = (member, category) => {
  if (category === 'staff') return 'Staff';
  if (member.isBlocked) return 'Blocked';
  if (member.status === 'archived') return 'Left Centre';
  if (!member.membershipStart || !member.membershipEnd) return 'No Dates';

  const today = new Date();
  today.setHours(0,0,0,0);

  const start = member.membershipStart.toDate ? member.membershipStart.toDate() : new Date(member.membershipStart);
  start.setHours(0,0,0,0);

  const end = member.membershipEnd.toDate ? member.membershipEnd.toDate() : new Date(member.membershipEnd);
  end.setHours(0,0,0,0);

  if (today < start) return 'Upcoming';
  if (today > end) return 'Expired';
  return 'Active';
};

const isBirthday = (dobTimestamp) => {
    if (!dobTimestamp) return false;
    try {
        const today = new Date();
        const dob = dobTimestamp.toDate ? dobTimestamp.toDate() : new Date(dobTimestamp);
        return today.getMonth() === dob.getMonth() && today.getDate() === dob.getDate();
    } catch(e) { return false; }
};

// --- Components ---

const AttendanceItem = ({ log, member, onEdit, now }) => {
  const origIn = log.originalCheckInTime ? formatTime(log.originalCheckInTime) : null;
  const origOut = log.originalCheckOutTime ? formatTime(log.originalCheckOutTime) : null;
  const showOriginalBox = (log.originalCheckInTime || log.originalCheckOutTime);
  const status = member ? getMemberStatus(member, log.category) : 'Unknown';
  
  // Calculate Duration Logic Updated
  let displayDuration = '0m';
  let isLive = false;
  if (log.checkOutTime) {
      // Completed Session
      const ms = getDuration(log.checkInTime, log.checkOutTime);
      displayDuration = formatDurationString(ms);
  } else if (log.checkInTime && now) {
      // Active Session (Live)
      try {
          const start = log.checkInTime.toDate ? log.checkInTime.toDate() : new Date(log.checkInTime);
          const ms = now - start;
          displayDuration = formatDurationString(ms);
          isLive = true;
      } catch(e) {}
  }

  const daysLeft = member ? getDaysRemaining(member.membershipEnd) : null;
  const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 2 && status === 'Active';
  const isExpired = status === 'Expired';

  return (
    <div className="p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-between border-b border-stone-100 dark:border-stone-800 last:border-0 group">
      <div className="flex items-center gap-4">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm shrink-0
          ${log.checkOutTime 
            ? 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400' 
            : log.category === 'staff' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-[#eef2e2] text-[#4a5d23] dark:bg-[#4a5d23]/30 dark:text-[#a3b86c]'
          }
        `}>
          {log.memberName ? log.memberName.charAt(0).toUpperCase() : '?'}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-semibold text-stone-800 dark:text-stone-200">{log.memberName}</div>
            
            {log.memberType && log.memberType !== 'Staff' && (
               <span className="text-[10px] font-medium text-stone-500 border border-stone-200 bg-stone-50 px-1.5 py-0.5 rounded dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
                  {log.memberType}
               </span>
            )}

            {log.seatNumber && (
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                Seat {log.seatNumber}
              </span>
            )}

            {log.category === 'staff' && (
               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 tracking-wide border border-purple-200 dark:border-purple-800">
                 <Briefcase size={10} /> Staff
               </span>
            )}

            {isExpired && (
               <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 uppercase">
                 <AlertCircle size={10} /> Expired
               </span>
            )}

            {isExpiringSoon && (
               <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800 animate-pulse">
                 <BellRing size={10} /> {daysLeft === 0 ? 'Exp Today' : `Exp in ${daysLeft}d`}
               </span>
            )}
          </div>
          
          <div className="mt-1">
             <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
               {log.checkOutTime ? 'Session Completed' : 'Currently Present'}
               {(isLive || log.checkOutTime) && (
                 <span className={`px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 ${isLive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'}`}>
                   <Timer size={10} /> {displayDuration}
                 </span>
               )}
             </div>

             {showOriginalBox && (
               <div className="mt-1.5 inline-block bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded px-2 py-1 animate-in fade-in zoom-in-95">
                 <div className="flex items-start gap-1.5">
                    <Info size={12} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-[10px] text-amber-800 dark:text-amber-300 leading-tight font-mono">
                      <span className="font-bold">Actual:</span> {origIn ? `In ${origIn}` : ''} 
                      {origOut && <span> • Out {origOut}</span>}
                    </div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
      
      <div className="text-right shrink-0 flex items-center gap-3">
        <div className="flex flex-col gap-1 items-end">
          <div className="text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded flex items-center gap-1 relative group/time">
            <LogIn size={12} className="text-stone-400" />
            {formatTime(log.checkInTime)}
            {(log.manualCheckIn || log.isEdited) && <Wrench size={10} className="text-blue-400 ml-1" />}
          </div>
          {log.checkOutTime ? (
            <div className="text-sm font-medium text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-900 px-2 py-0.5 rounded flex items-center gap-1">
              <LogOut size={12} className="text-stone-400" />
              {formatTime(log.checkOutTime)}
              {(log.manualCheckOut || log.isEdited) && <Wrench size={10} className="text-amber-400 ml-1" />}
            </div>
          ) : (
            <div className="h-6"></div> 
          )}
        </div>
        <button onClick={() => onEdit(log)} className="p-2 text-stone-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors">
          <Edit2 size={16} />
        </button>
      </div>
    </div>
  );
};

// --- Main Application Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [staff, setStaff] = useState([]); 
  const [logs, setLogs] = useState([]);
  const [appSettings, setAppSettings] = useState({ adminPin: DEFAULT_PIN });
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const [activeTab, setActiveTab] = useState('reader_kiosk'); 
  const [readerSubTab, setReaderSubTab] = useState('Full Day'); 
  const [halfDaySubFilter, setHalfDaySubFilter] = useState('All'); 
  const [rosterTab, setRosterTab] = useState('readers');
  const [feedback, setFeedback] = useState(null);
  const [welcomeScreen, setWelcomeScreen] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [showSeatMapModal, setShowSeatMapModal] = useState(false); 
  
  const [historyView, setHistoryView] = useState('daily'); 
  const [historySearchQuery, setHistorySearchQuery] = useState(''); 
  const [historyFilter, setHistoryFilter] = useState('All');
  const [expandedDates, setExpandedDates] = useState({});
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [targetTab, setTargetTab] = useState(null);
  const [newPin, setNewPin] = useState('');

  const [confirmModal, setConfirmModal] = useState(null); 
  const [deleteModal, setDeleteModal] = useState(null); 
  const [editLogModal, setEditLogModal] = useState(null);
  const [editMemberModal, setEditMemberModal] = useState(null);
  
  const [manualTime, setManualTime] = useState('');
  const [useManualTime, setUseManualTime] = useState(false);

  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Full Day'); 
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [singleDayDuration, setSingleDayDuration] = useState('Full Day');
  const [newSeat, setNewSeat] = useState(''); 
  const [newDob, setNewDob] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('Cash');
  const [newNotes, setNewNotes] = useState('');

  // Use state to force re-render every minute for live countdowns
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) { console.error("Auth error:", error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    try {
      const membersRef = collection(db, 'artifacts', appId, 'public', 'data', 'members');
      const unsubMembers = onSnapshot(membersRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setMembers(data);
      });

      const staffRef = collection(db, 'artifacts', appId, 'public', 'data', 'staff');
      const unsubStaff = onSnapshot(staffRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setStaff(data);
      });

      const logsRef = collection(db, 'artifacts', appId, 'public', 'data', 'attendance_logs');
      const unsubLogs = onSnapshot(logsRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, category: doc.data().category || 'student', ...doc.data() }));
        data.sort((a, b) => (b.checkInTime?.toMillis?.() || 0) - (a.checkInTime?.toMillis?.() || 0));
        setLogs(data);
      });

      const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'settings');
      const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) setAppSettings(docSnap.data());
        setLoading(false); 
      }, () => setLoading(false));

      return () => { unsubMembers(); unsubStaff(); unsubLogs(); unsubSettings(); };
    } catch (e) { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    let timeoutId;
    const lockApp = () => { 
      setIsAdmin(false); 
      setActiveTab('reader_kiosk'); 
      setFeedback({ type: 'success', message: 'Admin locked due to inactivity 🔒' }); 
      setTimeout(() => setFeedback(null), 3000); 
    };
    const resetTimer = () => { clearTimeout(timeoutId); timeoutId = setTimeout(lockApp, 120000); };
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    resetTimer();
    events.forEach(e => window.addEventListener(e, resetTimer));
    return () => { clearTimeout(timeoutId); events.forEach(e => window.removeEventListener(e, resetTimer)); };
  }, [isAdmin]);

  useEffect(() => {
    if (!members.length) return;
    const runMemberMaintenance = async () => {
      const now = new Date();
      const promotionCandidates = members.filter(m => m.pendingRenewal && m.membershipEnd);
      for (const m of promotionCandidates) {
        try {
          const endDate = m.membershipEnd.toDate();
          if (now > endDate) {
            const historyEntry = { start: m.membershipStart, end: m.membershipEnd, type: m.type, archivedAt: Timestamp.now() };
            const memberRef = doc(db, 'artifacts', appId, 'public', 'data', 'members', m.id);
            await updateDoc(memberRef, {
              membershipStart: m.pendingRenewal.start, membershipEnd: m.pendingRenewal.end, type: m.pendingRenewal.type,
              membershipHistory: [historyEntry, ...(m.membershipHistory || [])], pendingRenewal: deleteField(), status: 'active'
            });
          }
        } catch (e) {}
      }

      const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      const seatRemovalCandidates = members.filter(m => {
        if (!m.assignedSeat || !m.membershipEnd || m.status === 'archived' || m.pendingRenewal) return false;
        const endDate = m.membershipEnd.toDate ? m.membershipEnd.toDate() : new Date(m.membershipEnd);
        return endDate < oneDayAgo;
      });

      for (const m of seatRemovalCandidates) {
        try { 
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'members', m.id);
            const updates = { assignedSeat: null };
            if (m.assignedSeat) {
               updates.seatHistory = [{ seat: m.assignedSeat, leftAt: Timestamp.now() }, ...(m.seatHistory || [])];
            }
            await updateDoc(docRef, updates); 
        } catch (e) {}
      }
    };
    runMemberMaintenance();
  }, [members]);

  const todayStr = getTodayString();
  const todaysLogs = useMemo(() => logs.filter(log => log.dateString === todayStr), [logs, todayStr]);

  const getSeatOwners = (seatNum) => {
     const relevantMembers = members.filter(m => m.status !== 'archived' && m.assignedSeat == seatNum && getMemberStatus(m, 'student') !== 'Expired');
     const relevantStaff = staff.filter(s => s.status !== 'archived' && s.assignedSeat == seatNum);
     
     const owners = [...relevantMembers, ...relevantStaff];

     if (owners.length === 0) return null;

     const fullDayOwner = owners.find(m => ['Full Day', 'Single Day', 'Weekly', 'Staff'].includes(m.type));
     const morningOwner = owners.find(m => m.type === 'Morning Shift');
     const afternoonOwner = owners.find(m => m.type === 'Afternoon Shift');

     if (fullDayOwner) return { type: 'full', member: fullDayOwner };
     if (morningOwner || afternoonOwner) return { type: 'split', morning: morningOwner, afternoon: afternoonOwner };
     return { type: 'full', member: owners[0] };
  };

  const activeSeatCount = useMemo(() => {
    let count = 0;
    for (let i = 1; i <= TOTAL_SEATS; i++) {
        const owners = getSeatOwners(i);
        if (owners) count++;
    }
    return count;
  }, [members, staff]); 

  // NEW: Total Active Readers Count
  const totalActiveReaders = useMemo(() => members.filter(m => m.status !== 'archived').length, [members]);

  const seatOccupancy = useMemo(() => {
    const occupancy = {}; 
    for(let i=1; i<=TOTAL_SEATS; i++) occupancy[i] = { morning: null, afternoon: null };
    [...members, ...staff].forEach(m => {
      if (m.status !== 'archived' && m.assignedSeat) {
        const seat = parseInt(m.assignedSeat);
        if (occupancy[seat]) {
            const type = m.type || 'Staff'; 
            const isStaffMember = staff.some(s => s.id === m.id);
            const status = getMemberStatus(m, isStaffMember ? 'staff' : 'student');
            if (status === 'Active' || status === 'Upcoming' || status === 'Staff') {
                if (['Full Day', 'Single Day', 'Weekly', 'Staff'].includes(type) || isStaffMember) {
                    occupancy[seat].morning = type; occupancy[seat].afternoon = type;
                } else if (type === 'Morning Shift') {
                    occupancy[seat].morning = type;
                } else if (type === 'Afternoon Shift') {
                    occupancy[seat].afternoon = type;
                }
            }
        }
      }
    });
    return occupancy;
  }, [members, staff]);

  const getSeatStatus = (seatNum, requestType, excludeMemberId = null) => {
      const seat = seatOccupancy[seatNum];
      if (!seat) return { available: true, reason: '' };
      const conflicts = members.filter(m => m.id !== excludeMemberId && m.status !== 'archived' && m.assignedSeat == seatNum && (getMemberStatus(m, 'student') === 'Active' || getMemberStatus(m, 'student') === 'Upcoming'));
      let isMorningBlocked = false, isAfternoonBlocked = false;
      conflicts.forEach(m => {
          if (['Full Day', 'Single Day', 'Weekly'].includes(m.type)) { isMorningBlocked = true; isAfternoonBlocked = true; }
          else if (m.type === 'Morning Shift') isMorningBlocked = true;
          else if (m.type === 'Afternoon Shift') isAfternoonBlocked = true;
      });
      let requiredMorning = ['Full Day', 'Single Day', 'Weekly', 'Morning Shift', 'Staff'].includes(requestType);
      let requiredAfternoon = ['Full Day', 'Single Day', 'Weekly', 'Afternoon Shift', 'Staff'].includes(requestType);
      if (requiredMorning && isMorningBlocked) return { available: false, reason: 'Morning Taken' };
      if (requiredAfternoon && isAfternoonBlocked) return { available: false, reason: 'Afternoon Taken' };
      return { available: true, reason: '' };
  };

  const getStatusMap = (targetLogs) => {
    const map = {};
    targetLogs.forEach(log => {
      if (!log.memberName) return;
      if (!log.checkOutTime) {
        map[log.memberName] = { status: 'checked-in', logId: log.id, startTime: log.checkInTime, manual: log.manualCheckIn, seat: log.seatNumber };
      } else {
        if (!map[log.memberName] || map[log.memberName].status !== 'checked-in') {
          map[log.memberName] = { status: 'checked-out', logId: log.id, endTime: log.checkOutTime, manual: log.manualCheckOut };
        }
      }
    });
    return map;
  };

  const readerLogsToday = useMemo(() => todaysLogs.filter(l => l.category !== 'staff'), [todaysLogs]);
  const staffLogsToday = useMemo(() => todaysLogs.filter(l => l.category === 'staff'), [todaysLogs]);
  const readerStatusMap = useMemo(() => getStatusMap(readerLogsToday), [readerLogsToday]);
  const staffStatusMap = useMemo(() => getStatusMap(staffLogsToday), [staffLogsToday]);

  const filteredList = useMemo(() => {
    let list = [];
    if (activeTab === 'roster') {
        if (rosterTab === 'staff') list = staff.filter(s => s.status !== 'archived'); 
        else if (rosterTab === 'ex_staff') list = staff.filter(s => s.status === 'archived');
        else if (rosterTab === 'archived') list = members.filter(m => m.status === 'archived');
        else list = members.filter(m => m.status !== 'archived');
    } else if (activeTab === 'staff_kiosk') list = staff.filter(s => s.status !== 'archived');
    else if (activeTab === 'reader_kiosk') {
      list = members.filter(m => m.status !== 'archived');
      if (readerSubTab === 'Half Day') {
        list = list.filter(m => ['Morning Shift', 'Afternoon Shift', 'Half Day'].includes(m.type));
        if (halfDaySubFilter !== 'All') list = list.filter(m => m.type === halfDaySubFilter);
      } else {
        // FIX: Specifically filter for the selected type (e.g. Full Day)
        list = list.filter(m => m.type === readerSubTab);
      }
    } else list = members;
    return list.filter(m => (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [members, staff, searchQuery, activeTab, rosterTab, readerSubTab, halfDaySubFilter]);

  const historyLogs = useMemo(() => {
    if (historyView === 'monthly' || historyView === 'yearly') return []; 
    const grouped = {};
    logs.forEach(log => {
      // FIX: Add safe navigation for memberName to prevent crashes on bad data
      if (historySearchQuery && !log.memberName?.toLowerCase().includes(historySearchQuery.toLowerCase())) return;
      if (historyFilter !== 'All' && ((historyFilter === 'Staff' && log.category !== 'staff') || (historyFilter !== 'Staff' && log.memberType !== historyFilter))) return;
      if (!log.dateString) return;
      if (!grouped[log.dateString]) grouped[log.dateString] = [];
      grouped[log.dateString].push(log);
    });
    return grouped;
  }, [logs, historySearchQuery, historyFilter, historyView]);

  // NEW: Monthly Unique Visitors Calculation
  const monthlyUniqueStats = useMemo(() => {
    const stats = {};
    logs.forEach(log => {
      if (!log.checkInTime) return;
      if (log.dateString) {
          const monthKey = log.dateString.substring(0, 7); // YYYY-MM
          if (!stats[monthKey]) stats[monthKey] = new Set();
          stats[monthKey].add(log.memberName);
      }
    });
    return Object.entries(stats)
      .map(([key, set]) => {
        const [year, month] = key.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1);
        const monthName = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
        return { key, label: monthName, count: set.size };
      })
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [logs]);

  const busyHours = useMemo(() => {
    const hours = new Array(24).fill(0);
    logs.forEach(log => {
      if (log.checkInTime) {
        try {
          const date = log.checkInTime.toDate ? log.checkInTime.toDate() : new Date(log.checkInTime);
          const hour = date.getHours();
          if (!isNaN(hour)) hours[hour]++;
        } catch(e) {}
      }
    });
    const max = Math.max(...hours, 1);
    return hours.map(count => ({ count, height: (count / max) * 100 }));
  }, [logs]);

  const sortedDates = useMemo(() => Object.keys(historyLogs).sort((a, b) => new Date(b) - new Date(a)), [historyLogs]);

  const handleTabChange = (tab) => {
    if (tab === 'reader_kiosk') { setActiveTab(tab); return; }
    if (isAdmin) { setActiveTab(tab); } 
    else { setTargetTab(tab); setShowPinModal(true); setPinInput(''); }
  };

  const verifyPin = () => {
    if (pinInput === (appSettings.adminPin || DEFAULT_PIN)) {
      setIsAdmin(true); setShowPinModal(false); if (targetTab) setActiveTab(targetTab); setPinInput('');
    } else {
      setFeedback({ type: 'error', message: 'Incorrect PIN' }); setPinInput(''); setTimeout(() => setFeedback(null), 1500);
    }
  };

  const autoCheckOutMember = async (memberName) => {
    const activeLog = logs.find(l => l.memberName === memberName && l.dateString === todayStr && !l.checkOutTime);
    if (activeLog) {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance_logs', activeLog.id), { checkOutTime: serverTimestamp(), status: 'completed', autoCheckedOut: true });
      } catch (e) {}
    }
  };

  const handlePersonClick = (person, category) => {
    if (person.isBlocked) { setFeedback({ type: 'error', message: 'Blocked.' }); setTimeout(() => setFeedback(null), 3000); return; }
    const map = category === 'staff' ? staffStatusMap : readerStatusMap;
    const statusObj = map[person.name];
    openConfirmationModal(person, category, statusObj?.status === 'checked-in', statusObj?.logId, person.assignedSeat);
  };

  const openConfirmationModal = (person, category, isCheckedIn, logId, seatNumber = null) => {
    const now = new Date();
    setManualTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    setUseManualTime(false);
    setConfirmModal({ person, category, action: isCheckedIn ? 'Check Out' : 'Check In', logId, seatNumber });
  };

  const executeAttendanceAction = async () => {
    if (!confirmModal || isSubmitting) return; 
    setIsSubmitting(true);
    const { person, category, action, logId, seatNumber } = confirmModal;
    let timestampToUse = useManualTime && manualTime ? Timestamp.fromDate(combineDateAndTime(new Date(), manualTime)) : serverTimestamp();
    let originalTimestamp = useManualTime ? serverTimestamp() : null;
    let isManual = useManualTime;

    try {
      if (action === 'Check Out') {
        const updates = { checkOutTime: timestampToUse, status: 'completed', manualCheckOut: isManual };
        if (isManual) updates.originalCheckOutTime = originalTimestamp;
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance_logs', logId), updates);
        
        // NEW: Auto-archive Single Day users AND clear their seats on Checkout
        if (category !== 'staff' && person.type === 'Single Day') {
           try { 
               const memberRef = doc(db, 'artifacts', appId, 'public', 'data', 'members', person.id);
               const archiveUpdates = { status: 'archived', archivedAt: serverTimestamp() };
               
               // Clear seat and log history if applicable
               if (person.assignedSeat) {
                   archiveUpdates.assignedSeat = null;
                   // Use existing history or create new array
                   const newHistoryEntry = { seat: person.assignedSeat, leftAt: Timestamp.now() };
                   archiveUpdates.seatHistory = [newHistoryEntry, ...(person.seatHistory || [])];
               }
               
               await updateDoc(memberRef, archiveUpdates); 
           } catch (e) {
               console.error("Auto-archive failed", e);
           }
        }
        setWelcomeScreen({ type: 'check-out', name: person.name });
      } else {
        const newDoc = { memberName: person.name, memberType: person.type || 'Staff', category, dateString: todayStr, checkInTime: timestampToUse, checkOutTime: null, status: 'active', manualCheckIn: isManual, seatNumber: seatNumber ? parseInt(seatNumber) : null };
        if (isManual) newDoc.originalCheckInTime = originalTimestamp;
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'attendance_logs'), newDoc);
        try {
            const memberRef = doc(db, 'artifacts', appId, 'public', 'data', category === 'staff' ? 'staff' : 'members', person.id);
            const lastCheckIn = person.lastCheckInDate ? person.lastCheckInDate.toDate() : null;
            const today = new Date(); today.setHours(0,0,0,0);
            let newStreak = person.currentStreak || 0;
            if (lastCheckIn) {
               lastCheckIn.setHours(0,0,0,0);
               const diffDays = Math.ceil(Math.abs(today - lastCheckIn) / (1000 * 60 * 60 * 24));
               const isSundaySkip = (diffDays === 2 && today.getDay() === 1 && lastCheckIn.getDay() === 6);
               if (diffDays === 1 || isSundaySkip) newStreak += 1; else if (diffDays > 1) newStreak = 1;
            } else newStreak = 1;
            await updateDoc(memberRef, { lastCheckInDate: serverTimestamp(), currentStreak: newStreak });
        } catch (e) {}
        setWelcomeScreen({ type: 'check-in', name: person.name });
      }
    } catch (e) { setFeedback({ type: 'error', message: 'Action failed.' }); }
    finally { setIsSubmitting(false); setConfirmModal(null); setTimeout(() => setWelcomeScreen(null), 1900); }
  };

  const saveLogEdit = async () => {
    if (!editLogModal) return;
    try {
      const originalDate = (editLogModal.checkInTime && editLogModal.checkInTime.toDate) ? editLogModal.checkInTime.toDate() : new Date();
      const updates = { isEdited: true };
      if (!editLogModal.originalCheckInTime && editLogModal.checkInTime) updates.originalCheckInTime = editLogModal.checkInTime;
      if (!editLogModal.originalCheckOutTime && editLogModal.checkOutTime) updates.originalCheckOutTime = editLogModal.checkOutTime;
      if (editLogModal.editCheckIn !== undefined && editLogModal.editCheckIn !== '') {
         updates.checkInTime = Timestamp.fromDate(combineDateAndTime(originalDate, editLogModal.editCheckIn));
      }
      if (editLogModal.editCheckOut) { 
          updates.checkOutTime = Timestamp.fromDate(combineDateAndTime(originalDate, editLogModal.editCheckOut)); updates.status = 'completed'; 
      } else if (editLogModal.editCheckOut === '') { 
          updates.checkOutTime = null; updates.status = 'active'; 
      }
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance_logs', editLogModal.id), updates); 
      setFeedback({ type: 'success', message: 'Record updated.' }); setEditLogModal(null);
    } catch (e) { setFeedback({ type: 'error', message: 'Failed to update.' }); }
    setTimeout(() => setFeedback(null), 3000);
  };

  const openEditMember = (person, category) => {
    setEditMemberModal({
      ...person, category: category || 'student', editName: person.name, editType: person.type, editDuration: person.duration || 'Full Day', editAssignedSeat: person.assignedSeat || '', 
      editStartDate: formatDateForInput(person.membershipStart), editEndDate: formatDateForInput(person.membershipEnd), editDob: formatDateForInput(person.birthDate), 
      editNotes: person.notes || '', editIsBlocked: person.isBlocked || false, editHistory: person.membershipHistory || [], 
      seatHistory: person.seatHistory || [], // Ensure seatHistory is carried over
      paymentHistory: person.payments || [], paymentAmount: '', paymentMethod: 'Cash', paymentNote: ''
    });
  };

  const openMemberHistory = (person) => {
    setEditMemberModal({ ...person, category: 'student', editName: person.name, editType: person.type, editStartDate: formatDateForInput(person.membershipStart), editEndDate: formatDateForInput(person.membershipEnd), editDob: formatDateForInput(person.birthDate), editNotes: person.notes || '', editHistory: person.membershipHistory || [], seatHistory: person.seatHistory || [], paymentHistory: person.payments || [], mode: 'history' });
  };

  const openRestoreMember = (person) => {
    const category = (person.type === 'Staff' || rosterTab === 'ex_staff') ? 'staff' : 'student';
    setEditMemberModal({ ...person, category, editName: person.name, editType: person.type, editDuration: person.duration || 'Full Day', editAssignedSeat: person.assignedSeat || '', editStartDate: formatDateForInput(person.membershipStart), editEndDate: formatDateForInput(person.membershipEnd), editDob: formatDateForInput(person.birthDate), editNotes: person.notes || '', editIsBlocked: person.isBlocked || false, editHistory: person.membershipHistory || [], seatHistory: person.seatHistory || [], paymentHistory: person.payments || [], paymentAmount: '', paymentMethod: 'Cash', paymentNote: '', mode: 'restore' });
  };

  const openRenewMember = (person) => {
      let durationMs = 30 * 24 * 60 * 60 * 1000; 
      try {
          if (person.membershipStart && person.membershipEnd) {
              const start = person.membershipStart.toDate ? person.membershipStart.toDate() : new Date(person.membershipStart);
              const end = person.membershipEnd.toDate ? person.membershipEnd.toDate() : new Date(person.membershipEnd);
              if (!isNaN(start.getTime()) && !isNaN(end.getTime())) durationMs = end - start;
          }
      } catch (e) {}
      const newStart = new Date(); const newEnd = new Date(newStart.getTime() + durationMs);
      setEditMemberModal({ ...person, category: 'student', editName: person.name, editType: person.type, editDuration: person.duration || 'Full Day', editAssignedSeat: person.assignedSeat || '', editStartDate: formatDateForInput(Timestamp.fromDate(newStart)), editEndDate: formatDateForInput(Timestamp.fromDate(newEnd)), editDob: formatDateForInput(person.birthDate), editNotes: person.notes || '', editIsBlocked: person.isBlocked || false, editHistory: person.membershipHistory || [], seatHistory: person.seatHistory || [], paymentHistory: person.payments || [], paymentAmount: '', paymentMethod: 'Cash', paymentNote: '', mode: 'renew' });
  };

  const saveMemberUpdate = async () => {
    if(!editMemberModal) return;
    try {
      const collectionName = editMemberModal.category === 'staff' ? 'staff' : 'members';
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', collectionName, editMemberModal.id);
      const updates = {};
      updates.birthDate = editMemberModal.editDob ? Timestamp.fromDate(new Date(editMemberModal.editDob)) : null;
      updates.notes = editMemberModal.editNotes;
      updates.isBlocked = editMemberModal.editIsBlocked;
      
      const oldSeat = editMemberModal.assignedSeat;
      const newSeat = editMemberModal.editAssignedSeat ? parseInt(editMemberModal.editAssignedSeat) : null;
      
      updates.assignedSeat = newSeat;

      if (oldSeat != newSeat) {
          if (oldSeat) {
             const historyEntry = { seat: oldSeat, leftAt: Timestamp.now() };
             updates.seatHistory = [historyEntry, ...(editMemberModal.seatHistory || [])];
          }
      }

      let newStartTimestamp = null, newEndTimestamp = null;
      if (editMemberModal.editStartDate) { const d = new Date(editMemberModal.editStartDate); d.setHours(12, 0, 0, 0); newStartTimestamp = Timestamp.fromDate(d); }
      if (editMemberModal.editEndDate) { const d = new Date(editMemberModal.editEndDate); d.setHours(12, 0, 0, 0); newEndTimestamp = Timestamp.fromDate(d); }

      const currentEnd = editMemberModal.membershipEnd ? editMemberModal.membershipEnd.toDate() : null;
      const newStart = newStartTimestamp ? newStartTimestamp.toDate() : null;
      const isFutureRenewal = currentEnd && newStart && newStart > currentEnd && editMemberModal.mode !== 'restore' && editMemberModal.mode !== 'renew';

      if (isFutureRenewal) {
         updates.pendingRenewal = { start: newStartTimestamp, end: newEndTimestamp, type: editMemberModal.editType, createdAt: Timestamp.now(), paymentInfo: editMemberModal.paymentAmount ? { amount: editMemberModal.paymentAmount, method: editMemberModal.paymentMethod, note: editMemberModal.paymentNote } : null };
         if (editMemberModal.editName !== editMemberModal.name) updates.name = editMemberModal.editName;
         await updateDoc(docRef, updates); setFeedback({ type: 'success', message: 'Renewal scheduled.' });
      } else {
          updates.name = editMemberModal.editName; updates.type = editMemberModal.editType; updates.membershipHistory = editMemberModal.editHistory || [];
          if (editMemberModal.editType === 'Single Day') updates.duration = editMemberModal.editDuration; else updates.duration = deleteField();
          if (editMemberModal.mode === 'restore') updates.status = 'active';

          const oldStartStr = formatDateForInput(editMemberModal.membershipStart); const oldEndStr = formatDateForInput(editMemberModal.membershipEnd);
          if (oldStartStr && oldEndStr && (oldStartStr !== editMemberModal.editStartDate || oldEndStr !== editMemberModal.editEndDate)) {
              updates.membershipHistory = [{ start: editMemberModal.membershipStart, end: editMemberModal.membershipEnd, type: editMemberModal.type, archivedAt: Timestamp.now() }, ...updates.membershipHistory];
          }
          updates.membershipStart = newStartTimestamp; updates.membershipEnd = newEndTimestamp;
          if (editMemberModal.paymentAmount) updates.payments = [{ amount: editMemberModal.paymentAmount, method: editMemberModal.paymentMethod, date: Timestamp.now(), type: 'Renewal' }, ...(editMemberModal.paymentHistory || [])];

          await updateDoc(docRef, updates); setFeedback({ type: 'success', message: editMemberModal.mode === 'renew' ? 'Membership Renewed!' : 'Member updated.' });
      }
      setEditMemberModal(null);
    } catch (e) { setFeedback({ type: 'error', message: 'Update failed.' }); }
    setTimeout(() => setFeedback(null), 3000);
  };

  const executeDeletePerson = async () => {
    if (!deleteModal) return;
    await autoCheckOutMember(deleteModal.name);
    try {
      const collectionName = deleteModal.category === 'staff' ? 'staff' : 'members';
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, deleteModal.id));
      setFeedback({ type: 'success', message: 'Deleted successfully.' });
    } catch(e) { setFeedback({ type: 'error', message: 'Failed to delete.' }); }
    setDeleteModal(null); setTimeout(() => setFeedback(null), 3000);
  };

  const updateMemberStatus = async (member, newStatus) => {
    if (newStatus === 'archived') await autoCheckOutMember(member.name);
    try {
      const collectionName = (member.type === 'Staff' || rosterTab === 'staff') ? 'staff' : 'members';
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', collectionName, member.id);
      const updates = { status: newStatus };
      if (newStatus === 'archived') {
          updates.pendingRenewal = deleteField();
          if (collectionName === 'staff') { const today = new Date(); today.setHours(12, 0, 0, 0); updates.membershipEnd = Timestamp.fromDate(today); }
          if (member.assignedSeat) {
             updates.seatHistory = [{ seat: member.assignedSeat, leftAt: Timestamp.now() }, ...(member.seatHistory || [])];
             updates.assignedSeat = null; 
          }
      } else if (newStatus === 'active') {
          if (collectionName === 'staff') updates.membershipEnd = null;
      }
      await updateDoc(docRef, updates);
      setFeedback({ type: 'success', message: `Moved to ${newStatus === 'archived' ? 'Archive' : 'Active'} list.` });
    } catch (e) { setFeedback({ type: 'error', message: 'Action failed.' }); }
    setTimeout(() => setFeedback(null), 3000);
  };

  const addToRoster = async () => {
    if (!newName.trim()) return;
    try {
      const collectionName = rosterTab === 'staff' ? 'staff' : 'members';
      let initialStart = null;
      if (rosterTab === 'staff') { const today = new Date(); today.setHours(12, 0, 0, 0); initialStart = Timestamp.fromDate(today); }

      const newDoc = {
        name: newName.trim(), type: rosterTab === 'staff' ? 'Staff' : newType, createdAt: serverTimestamp(), membershipStart: initialStart, membershipEnd: null, membershipHistory: [], seatHistory: [], status: 'active', currentStreak: 0, notes: newNotes, birthDate: newDob ? Timestamp.fromDate(new Date(newDob)) : null, isBlocked: false, assignedSeat: newSeat ? parseInt(newSeat) : null 
      };
      if (rosterTab === 'readers' && newType === 'Single Day') {
         const today = new Date(); today.setHours(12, 0, 0, 0); newDoc.membershipStart = Timestamp.fromDate(today); newDoc.membershipEnd = Timestamp.fromDate(today); newDoc.duration = singleDayDuration;
      } else {
          if (newStartDate) { const d = new Date(newStartDate); d.setHours(12, 0, 0, 0); newDoc.membershipStart = Timestamp.fromDate(d); }
          if (newEndDate) { const d = new Date(newEndDate); d.setHours(12, 0, 0, 0); newDoc.membershipEnd = Timestamp.fromDate(d); }
      }
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', collectionName), newDoc);
      if (newPaymentAmount) await updateDoc(docRef, { payments: [{ amount: newPaymentAmount, method: newPaymentMethod, date: Timestamp.now(), type: 'Registration' }] });
      setFeedback({ type: 'success', message: `Added to list.` });
      setNewName(''); setNewStartDate(''); setNewEndDate(''); setNewSeat(''); setNewDob(''); setNewNotes(''); setNewPaymentAmount(''); setNewPaymentMethod('Cash');
    } catch (e) { setFeedback({ type: 'error', message: 'Could not add person.' }); }
    setTimeout(() => setFeedback(null), 2000);
  };
  
  const isAddDisabled = !newName.trim() || (rosterTab === 'readers' && newType !== 'Single Day' && (!newStartDate || !newEndDate));

  return (
    <div className={`min-h-screen font-sans selection:bg-[#dce6c5] pb-20 relative transition-colors duration-300 ${darkMode ? 'dark bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-800'}`} style={{ fontFamily: "'Nunito', sans-serif" }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');`}
      </style>
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center w-full sm:w-auto">
            <div>
              <h1 className="text-xl font-bold text-[#4a5d23] dark:text-[#a3b86c] leading-none tracking-wide" style={{ fontFamily: "'Nunito', sans-serif" }}>SYKiA READING NOOK</h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-1">Attendance Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
             <button onClick={() => setShowSeatMapModal(true)} className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer">
                <Sofa size={16} className={activeSeatCount >= TOTAL_SEATS ? "text-red-500" : "text-stone-500 dark:text-stone-400"} />
                <span className={`text-sm font-bold ${activeSeatCount >= TOTAL_SEATS ? "text-red-500" : "text-stone-600 dark:text-stone-300"}`}>{activeSeatCount} / {TOTAL_SEATS}</span>
             </button>
             <button type="button" onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            {isAdmin && (<div className="flex items-center gap-2"><button type="button" onClick={() => { setShowSettingsModal(true); setNewPin(''); }} className="flex items-center gap-1 text-xs font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-1.5 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"><Settings size={14} /></button><button type="button" onClick={() => { setIsAdmin(false); setActiveTab('reader_kiosk'); }} className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"><Lock size={14} /> Lock</button></div>)}
            {!isAdmin && (<div className="text-stone-300 dark:text-stone-700"><Unlock size={16} /></div>)}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 relative z-0">
        <div className="flex gap-2 mb-6 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl overflow-x-auto">
          <button 
            type="button" 
            onClick={() => handleTabChange('reader_kiosk')} 
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'reader_kiosk' ? 'bg-white dark:bg-stone-700 text-[#4a5d23] dark:text-[#a3b86c] shadow-sm' : 'text-stone-500 dark:text-stone-400'}`}
          >
            <BookOpen size={18} /> Readers
          </button>
          
          <button 
            type="button" 
            onClick={() => handleTabChange('staff_kiosk')} 
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'staff_kiosk' ? 'bg-white dark:bg-stone-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-stone-500 dark:text-stone-400'}`}
          >
            {!isAdmin && <Lock size={14} className="opacity-50" />}
            <Briefcase size={18} /> Staff
          </button>
          
          <button 
            type="button" 
            onClick={() => handleTabChange('roster')} 
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'roster' ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 shadow-sm' : 'text-stone-500 dark:text-stone-400'}`}
          >
            {!isAdmin && <Lock size={14} className="opacity-50" />}
            <Users size={18} /> Roster
          </button>
          
          <button 
            type="button" 
            onClick={() => handleTabChange('history')} 
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-stone-500 dark:text-stone-400'}`}
          >
            {!isAdmin && <Lock size={14} className="opacity-50" />}
            <History size={18} /> History
          </button>
        </div>

        {(activeTab === 'reader_kiosk' || activeTab === 'staff_kiosk') && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {activeTab === 'reader_kiosk' && (
              <div className="flex flex-col items-center mb-6">
                <div className="flex justify-center overflow-x-auto pb-2 w-full">
                  <div className="bg-stone-200 dark:bg-stone-800 p-1 rounded-lg flex gap-1 flex-nowrap">
                    {['Full Day', 'Half Day', 'Single Day', 'Weekly'].map(tab => (
                        <button key={tab} type="button" onClick={() => { setReaderSubTab(tab); setHalfDaySubFilter('All'); }} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all whitespace-nowrap ${readerSubTab === tab ? 'bg-white dark:bg-stone-600 text-[#4a5d23] dark:text-[#a3b86c] shadow-sm' : 'text-stone-500 dark:text-stone-400'}`}>{tab}</button>
                    ))}
                  </div>
                </div>
                {readerSubTab === 'Half Day' && (
                  <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
                    {['All', 'Morning Shift', 'Afternoon Shift'].map(filter => (
                        <button key={filter} type="button" onClick={() => setHalfDaySubFilter(filter)} className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${halfDaySubFilter === filter ? 'bg-stone-800 text-white dark:bg-white dark:text-stone-900' : 'bg-white dark:bg-stone-800 text-stone-500'}`}>{filter === 'Morning Shift' ? 'Morning' : filter === 'Afternoon Shift' ? 'Afternoon' : 'All'}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400"><Search size={20} /></div>
              <input type="text" placeholder={`Search ${activeTab === 'staff_kiosk' ? 'staff' : 'reader'}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:border-[#4a5d23] dark:text-white transition-all" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredList.map(person => {
                const map = activeTab === 'staff_kiosk' ? staffStatusMap : readerStatusMap;
                const statusObj = map[person.name];
                const isCheckedIn = statusObj?.status === 'checked-in';
                const statusLabel = getMemberStatus(person, activeTab === 'staff_kiosk' ? 'staff' : 'student');
                const isActive = statusLabel === 'Active';
                const isExpired = statusLabel === 'Expired';
                const isUpcoming = statusLabel === 'Upcoming';
                const daysLeft = getDaysRemaining(person.membershipEnd);
                const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 2 && !isExpired;

                // NEW: Calculate Live Duration for ALL checked-in users
                let liveDuration = null;
                if (isCheckedIn && statusObj?.startTime) {
                   const start = statusObj.startTime.toDate ? statusObj.startTime.toDate() : new Date(statusObj.startTime);
                   const ms = now - start;
                   liveDuration = formatDurationString(ms);
                }

                // Calculate remaining time for Single Day users
                let singleDayRemaining = null;
                if (person.type === 'Single Day' && isCheckedIn && statusObj?.startTime) {
                   const durationStr = person.duration || "0";
                   const hours = parseInt(durationStr); 
                   if (!isNaN(hours)) {
                      const start = statusObj.startTime.toDate ? statusObj.startTime.toDate() : new Date(statusObj.startTime);
                      const end = new Date(start.getTime() + (hours * 60 * 60 * 1000));
                      const diffMs = end - now;
                      if (diffMs > 0) {
                         const h = Math.floor(diffMs / (1000 * 60 * 60));
                         const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                         singleDayRemaining = `${h}h ${m}m Left`;
                      } else {
                         singleDayRemaining = "Time Up";
                      }
                   }
                }

                return (
                  <button key={person.id} type="button" onClick={() => handlePersonClick(person, activeTab === 'staff_kiosk' ? 'staff' : 'student')} disabled={person.isBlocked} className={`relative group flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${isCheckedIn ? (activeTab === 'staff_kiosk' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 shadow-lg scale-[1.02]' : 'bg-[#f4f7ec] dark:bg-[#4a5d23]/20 border-[#4a5d23] shadow-lg scale-[1.02]') : isExpired ? 'bg-red-50 dark:bg-red-900/20 border-red-200' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-[#a3b86c]'}`}>
                     {(person.currentStreak > 0 && !person.isBlocked) && <div className="absolute top-2 left-2 flex items-center gap-0.5 text-orange-500 text-[10px] font-bold"><Zap size={12} fill="currentColor" /> {person.currentStreak}</div>}
                     {isBirthday(person.birthDate) && <div className="absolute top-2 right-2 text-pink-500 animate-bounce"><Cake size={16} /></div>}
                     {person.isBlocked && <div className="absolute inset-0 flex items-center justify-center bg-stone-100/50 dark:bg-stone-900/50 z-10"><Ban size={32} className="text-red-500" /></div>}
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-3 transition-colors ${isCheckedIn ? (activeTab === 'staff_kiosk' ? 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-[#dce6c5] text-[#4a5d23] dark:bg-[#4a5d23] dark:text-[#dce6c5]') : 'bg-stone-100 dark:bg-stone-700 text-stone-500'}`}>{person.name.charAt(0).toUpperCase()}</div>
                    <div className="text-center w-full flex flex-col items-center gap-1">
                      <div className="font-bold text-stone-800 dark:text-stone-200 truncate px-2 w-full">{person.name}</div>
                      {(person.type === 'Morning Shift' || person.type === 'Afternoon Shift') && <span className="text-[9px] font-bold text-stone-500 bg-stone-100 dark:text-stone-400 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700 uppercase tracking-wide">{person.type.replace(' Shift', '')}</span>}
                      {person.assignedSeat && <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${isCheckedIn ? (activeTab === 'staff_kiosk' ? 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/40' : 'text-[#4a5d23] dark:text-[#a3b86c] bg-[#eef2e2] dark:bg-[#4a5d23]/30') : 'text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800'}`}>Seat {person.assignedSeat}</div>}
                      
                      {/* NEW: Checked In Duration Badge (Purple for Staff, Green for Readers) */}
                      {isCheckedIn && liveDuration && (
                        <div className="mt-1 flex flex-col items-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 animate-in fade-in ${activeTab === 'staff_kiosk' ? 'text-purple-700 bg-purple-100 border-purple-200 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-800' : 'text-green-700 bg-[#dce6c5] border-green-200 dark:bg-[#4a5d23]/40 dark:text-green-200 dark:border-green-800'}`}>
                             Checked In • {liveDuration}
                          </span>
                        </div>
                      )}

                      {isActive && !isCheckedIn && !isExpiringSoon && activeTab !== 'staff_kiosk' && <span className="text-[9px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded border border-green-200 dark:border-green-800 uppercase mt-1">Active</span>}
                      {isExpired && activeTab !== 'staff_kiosk' && <span className="text-[9px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800 uppercase mt-1">Expired</span>}
                      {isUpcoming && <span className="text-[9px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 uppercase mt-1">Upcoming</span>}
                      {person.pendingRenewal && <span className="text-[9px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 uppercase mt-1 flex items-center gap-1"><RotateCcw size={8} /> Queued</span>}
                      {isExpiringSoon && <div className="text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1 animate-pulse border border-orange-200 dark:border-orange-800 mt-1">
                        <BellRing size={8} /> 
                        {person.type === 'Single Day' ? (person.duration || '1 Day') : (daysLeft === 0 ? 'Exp Today' : `Exp ${daysLeft}d`)}
                      </div>}
                      {singleDayRemaining && <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border ${singleDayRemaining === 'Time Up' ? 'text-red-600 bg-red-50 border-red-200' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>{singleDayRemaining}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
              
              <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 mb-6">
                 <h3 className="font-bold text-stone-800 dark:text-white flex items-center gap-2 mb-6"><BarChart3 size={18} className="text-[#4a5d23]"/> Peak Hours</h3>
                 <div className="flex items-end justify-between h-32 gap-1">
                    {busyHours.map((h, i) => (
                       <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                          <div className="w-full bg-[#eef2e2] dark:bg-[#4a5d23]/20 rounded-t-sm relative transition-all group-hover:bg-[#dce6c5] dark:group-hover:bg-[#4a5d23]/40" style={{ height: `${h.height}%` }}>
                             <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 transition-opacity">
                                {h.count} Visits
                             </div>
                          </div>
                          <span className="text-[9px] text-stone-400 font-mono rotate-0 sm:rotate-0">{i % 3 === 0 ? `${i}h` : ''}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Monthly Unique Visitors Card */}
              <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 mb-6">
                  <h3 className="font-bold text-stone-800 dark:text-white flex items-center gap-2 mb-4">
                      <Users size={18} className="text-[#4a5d23]" /> Monthly Unique Visitors
                  </h3>
                  <div className="space-y-3">
                      {monthlyUniqueStats.map(stat => (
                          <div key={stat.key} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                              <span className="font-medium text-stone-600 dark:text-stone-300">{stat.label}</span>
                              <span className="font-bold text-[#4a5d23] dark:text-[#a3b86c] bg-[#eef2e2] dark:bg-[#4a5d23]/20 px-3 py-1 rounded-full text-xs">
                                  {stat.count} People
                              </span>
                          </div>
                      ))}
                      {monthlyUniqueStats.length === 0 && <div className="text-center text-stone-400 text-sm italic">No data available</div>}
                  </div>
              </div>

              {/* History Search Bar (Moved Here) */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400"><Search size={20} /></div>
                <input 
                  type="text" 
                  placeholder="Search history records..." 
                  value={historySearchQuery} 
                  onChange={(e) => setHistorySearchQuery(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:border-[#4a5d23] dark:text-white transition-all" 
                />
              </div>

              {sortedDates.map(dateStr => (
                 <div key={dateStr} className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden mb-4">
                    <button type="button" onClick={() => setExpandedDates(prev => ({ ...prev, [dateStr]: !prev[dateStr] }))} className="w-full flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-left">
                       <span className="font-bold text-stone-700 dark:text-stone-200">{formatDateStringHeader(dateStr)}</span>
                       <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 px-2 py-1 rounded border border-stone-200 dark:border-stone-700">{historyLogs[dateStr].length} Recs</div>
                    </button>
                    {/* FIX: Pass 'now' to AttendanceItem so it can calculate live duration for active sessions */}
                    {(expandedDates[dateStr]) && <div className="divide-y divide-stone-100 dark:divide-stone-800 border-t border-stone-200 dark:border-stone-800">{historyLogs[dateStr].map(log => <AttendanceItem key={log.id} log={log} member={null} onEdit={() => setEditLogModal(log)} now={now} />)}</div>}
                 </div>
              ))}
           </div>
        )}

        {activeTab === 'roster' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-center mb-6 overflow-x-auto">
                <div className="bg-stone-200 dark:bg-stone-800 p-1 rounded-lg flex gap-1 whitespace-nowrap">
                  {['readers', 'staff', 'archived', 'ex_staff'].map(t => (
                    <button key={t} type="button" onClick={() => setRosterTab(t)} className={`px-4 sm:px-6 py-1.5 rounded-md text-sm font-bold transition-all capitalize ${rosterTab === t ? 'bg-white dark:bg-stone-600 text-[#4a5d23] dark:text-[#a3b86c] shadow-sm' : 'text-stone-500 dark:text-stone-400'}`}>
                        {t === 'readers' ? 'Reader List' : t === 'staff' ? 'Staff List' : t === 'ex_staff' ? 'Ex-Staff' : 'Ex-Readers'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Active Readers Dashboard Card */}
              {rosterTab === 'readers' && (
                  <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#eef2e2] dark:bg-[#4a5d23]/20 p-4 rounded-xl border border-[#dce6c5] dark:border-[#4a5d23]/40 flex items-center justify-between">
                          <div>
                              <div className="text-xs font-bold text-[#4a5d23] dark:text-[#a3b86c] uppercase tracking-wide">Total Active Readers</div>
                              <div className="text-2xl font-extrabold text-[#4a5d23] dark:text-white mt-1">{totalActiveReaders}</div>
                          </div>
                          <Users size={32} className="text-[#4a5d23] dark:text-[#a3b86c] opacity-50" />
                      </div>
                  </div>
              )}

              {(rosterTab !== 'archived' && rosterTab !== 'ex_staff') && (
              <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 mb-6">
                 <h3 className="font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2"><Plus size={18}/> Add New</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="sm:col-span-2"><label className="block text-xs font-bold text-stone-400 uppercase mb-1">Full Name</label><input type="text" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. John Doe" className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg outline-none focus:border-[#4a5d23]" /></div>
                    {(rosterTab !== 'readers' || newType !== 'Single Day') && <div><label className="block text-xs font-bold text-stone-400 uppercase mb-1">Date of Birth</label><input type="date" value={newDob} onChange={e=>setNewDob(e.target.value)} className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg outline-none focus:border-[#4a5d23]" /></div>}
                    {rosterTab === 'readers' && <div><label className="block text-xs font-bold text-stone-400 uppercase mb-1">Type</label><select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg outline-none focus:border-[#4a5d23]"><option value="Full Day">Full Day</option><option value="Morning Shift">Morning Shift</option><option value="Afternoon Shift">Afternoon Shift</option><option value="Single Day">Single Day</option><option value="Weekly">Weekly</option></select></div>}
                    {rosterTab === 'readers' && newType === 'Single Day' && <div><label className="block text-xs font-bold text-stone-400 uppercase mb-1">Duration</label><select value={singleDayDuration} onChange={(e) => setSingleDayDuration(e.target.value)} className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg outline-none focus:border-[#4a5d23]"><option value="Full Day">Full Day</option>{[...Array(12)].map((_, i) => (<option key={i} value={`${i+1} ${i===0?'Hour':'Hours'}`}>{i+1} {i===0?'Hour':'Hours'}</option>))}</select></div>}
                    {rosterTab === 'readers' && newType !== 'Single Day' && <><div className="sm:col-span-2"><label className="block text-xs font-bold text-stone-400 uppercase mb-1">Start & End Date</label><div className="grid grid-cols-2 gap-2"><input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg" /><input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg" /></div></div></>}
                    
                    {(rosterTab === 'readers' || rosterTab === 'staff') && (
                      <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Assign Seat</label>
                        <select value={newSeat} onChange={(e) => setNewSeat(e.target.value)} className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg outline-none focus:border-[#4a5d23]">
                          <option value="">No Seat</option>
                          {[...Array(TOTAL_SEATS)].map((_, i) => { 
                             const seatNum = i + 1; 
                             const checkType = rosterTab === 'staff' ? 'Staff' : newType;
                             const { available, reason } = getSeatStatus(seatNum, checkType); 
                             return (<option key={seatNum} value={seatNum} disabled={!available} className={!available ? "text-gray-400 bg-gray-100" : ""}>Seat {seatNum} {!available ? `(${reason})` : ''}</option>)
                          })}
                        </select>
                      </div>
                    )}

                    {rosterTab === 'readers' && (
                       <>
                          <div>
                             <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Payment Amount</label>
                             <input type="number" placeholder="0" value={newPaymentAmount} onChange={e=>setNewPaymentAmount(e.target.value)} className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg outline-none focus:border-[#4a5d23]" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Payment Method</label>
                             <select value={newPaymentMethod} onChange={e=>setNewPaymentMethod(e.target.value)} className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg outline-none focus:border-[#4a5d23]">
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Card</option>
                             </select>
                          </div>
                       </>
                    )}

                    <div className="sm:col-span-2 lg:col-span-4 flex justify-end mt-2"><button type="button" onClick={addToRoster} disabled={isAddDisabled} className="px-8 py-3 rounded-lg font-bold text-white bg-[#4a5d23] hover:bg-[#3b4a1c] disabled:opacity-50 transition-colors shadow-lg">Add Member</button></div>
                 </div>
              </div>
              )}
              
              <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
                 <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-[500px] overflow-y-auto">
                 {filteredList.map(person => {
                    const statusLabel = getMemberStatus(person, (rosterTab === 'staff' || rosterTab === 'ex_staff') ? 'staff' : 'student');
                    const isActive = statusLabel === 'Active';
                    const isExpired = statusLabel === 'Expired';
                    const isUpcoming = statusLabel === 'Upcoming';
                    const daysLeft = getDaysRemaining(person.membershipEnd);
                    const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 2 && !isExpired;
                    const isRenewable = (() => { if (!person.membershipEnd || person.status === 'archived' || person.pendingRenewal) return false; const today = new Date(); today.setHours(0,0,0,0); const end = person.membershipEnd.toDate ? person.membershipEnd.toDate() : new Date(person.membershipEnd); end.setHours(0,0,0,0); return today >= end; })();

                    // Calculate checked in time for list view
                    const map = (rosterTab === 'staff' || rosterTab === 'ex_staff') ? staffStatusMap : readerStatusMap;
                    const statusObj = map[person.name];
                    const isCheckedIn = statusObj?.status === 'checked-in';
                    let liveDuration = null;
                    if (isCheckedIn && statusObj?.startTime) {
                        const start = statusObj.startTime.toDate ? statusObj.startTime.toDate() : new Date(statusObj.startTime);
                        liveDuration = formatDurationString(now - start);
                    }

                    return (
                    <div key={person.id} className="p-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-xs font-bold text-stone-500 dark:text-stone-300">{person.name.charAt(0).toUpperCase()}</div>
                          <div>
                             <div className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2 flex-wrap">
                                {person.name}
                                {person.assignedSeat && <span className="text-[10px] bg-[#eef2e2] text-[#4a5d23] px-1.5 py-0.5 rounded font-bold border border-stone-200 uppercase">Seat {person.assignedSeat}</span>}
                                
                                {/* RESTORED: Status Tags in Roster View - UPDATED TO SHOW ACTIVE FOR STAFF */}
                                {(rosterTab !== 'archived' && rosterTab !== 'ex_staff') && (isActive || rosterTab === 'staff') && !isExpiringSoon && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${rosterTab === 'staff' ? 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' : 'bg-green-50 text-green-600 border-green-100'}`}>Active</span>}
                                {(rosterTab !== 'archived' && rosterTab !== 'ex_staff') && isExpired && rosterTab !== 'staff' && <span className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold border border-red-100 uppercase">Expired</span>}
                                {(rosterTab !== 'archived' && rosterTab !== 'ex_staff') && isUpcoming && <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold border border-amber-100 uppercase">Upcoming</span>}
                                {(rosterTab !== 'archived' && rosterTab !== 'ex_staff') && isExpiringSoon && <span className="text-[9px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-bold border border-orange-100 uppercase flex items-center gap-1 animate-pulse">
                                  <BellRing size={8}/> 
                                  {person.type === 'Single Day' ? (person.duration || '1 Day') : (daysLeft === 0 ? 'Exp Today' : `Exp ${daysLeft}d`)}
                                </span>}
                                
                                {/* NEW: Checked In Status in List */}
                                {isCheckedIn && (
                                   <span className="text-[9px] bg-stone-800 text-white px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                                     Present {liveDuration && `(${liveDuration})`}
                                   </span>
                                )}
                                
                                {person.pendingRenewal && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-100 bg-blue-50 text-blue-600 uppercase flex items-center gap-1"><RotateCcw size={8} /> Queued</span>}
                             </div>
                             <div className="text-xs text-stone-400 dark:text-stone-500">{(rosterTab === 'staff' || rosterTab === 'ex_staff') ? 'Staff' : person.type} {person.type === 'Single Day' && person.duration && ` • ${person.duration}`}{(person.type === 'Staff' || rosterTab === 'staff' || rosterTab === 'ex_staff') && <span className="ml-2 pl-2 border-l border-stone-300 dark:border-stone-700">{person.membershipStart && <span>Joined: {formatDateShort(person.membershipStart)}</span>}</span>}</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          {(rosterTab !== 'archived' && rosterTab !== 'ex_staff') ? (
                             <>
                               {rosterTab === 'readers' && <button type="button" onClick={() => isRenewable && openRenewMember(person)} disabled={!isRenewable} className={`p-2 transition-colors ${isRenewable ? 'text-[#4a5d23] hover:bg-[#eef2e2] dark:hover:bg-[#4a5d23]/30' : 'text-stone-200 dark:text-stone-800 cursor-not-allowed'}`} title={isRenewable ? "Renew" : "Not yet due"}><RotateCcw size={16}/></button>}
                               <button type="button" onClick={() => openEditMember(person, rosterTab === 'staff' ? 'staff' : 'student')} className="p-2 text-stone-300 hover:text-blue-500 transition-colors"><Edit2 size={16}/></button>
                               {(rosterTab === 'readers' || rosterTab === 'staff') && <button type="button" onClick={() => updateMemberStatus(person, 'archived')} className="p-2 text-stone-300 hover:text-amber-500 transition-colors"><UserMinus size={16}/></button>}
                             </>
                          ) : (
                             <><button type="button" onClick={() => openMemberHistory(person)} className="p-2 text-stone-300 hover:text-indigo-500 transition-colors"><History size={16}/></button><button type="button" onClick={() => openRestoreMember(person)} className="p-2 text-stone-300 hover:text-green-500 transition-colors"><UserCheck size={16}/></button></>
                          )}
                          <button type="button" onClick={() => setDeleteModal({ id: person.id, name: person.name, category: (rosterTab === 'staff' || rosterTab === 'ex_staff') ? 'staff' : 'student' })} className="p-2 text-stone-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                       </div>
                    </div>
                 )})}
                 </div>
              </div>
           </div>
        )}
      </main>

      {/* --- MODALS --- */}
      {showSeatMapModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-800/50">
               <h3 className="font-bold text-stone-800 dark:text-white flex items-center gap-2"><Sofa size={20} className="text-[#4a5d23]"/> Live Seat Map</h3>
               <button onClick={() => setShowSeatMapModal(false)} className="text-stone-400 hover:text-stone-600"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto bg-stone-50 dark:bg-stone-950/50">
               <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
                  {[...Array(TOTAL_SEATS)].map((_, i) => {
                     const seatNum = i + 1;
                     const seatOwners = getSeatOwners(seatNum);
                     const activeLog = todaysLogs.find(l => !l.checkOutTime && l.seatNumber == seatNum);

                     // CASE 1: Occupied but NOT Assigned (e.g. Walk-in, or Seat Change not in profile)
                     if (!seatOwners && activeLog) {
                         const isStaff = activeLog.category === 'staff';
                         return (
                           <div key={seatNum} className={`aspect-square rounded-xl p-2 flex flex-col items-center justify-center text-center border-2 transition-all bg-[#c9db93] border-[#4a5d23] dark:bg-[#4a5d23]/40 dark:border-[#a3b86c]`}>
                              <span className="text-lg font-bold text-white drop-shadow-md">{seatNum}</span>
                              <span className="text-[10px] font-bold text-white drop-shadow-md leading-tight line-clamp-1">{activeLog.memberName}</span>
                              {isStaff ? <span className="text-[9px] font-bold text-purple-700 uppercase tracking-wide mt-0.5">Staff</span> : <span className="text-[9px] text-white mt-0.5">Present</span>}
                           </div>
                         );
                     }

                     // CASE 2: Empty and Unassigned
                     if (!seatOwners) {
                        return (
                           <div key={seatNum} className="aspect-square rounded-xl p-2 flex flex-col items-center justify-center text-center border-2 bg-stone-100 border-stone-300 dark:bg-stone-800 dark:border-stone-700 opacity-100">
                              <span className="text-lg font-bold text-stone-600 dark:text-stone-400 mb-1">{seatNum}</span>
                              <span className="text-[10px] text-stone-600 dark:text-stone-400 uppercase font-bold tracking-wider">Empty</span>
                           </div>
                        );
                     }
                     if (seatOwners.type === 'full') {
                        const m = seatOwners.member;
                        const isStaff = m.type === 'Staff';
                        const isCheckedIn = todaysLogs.some(l => !l.checkOutTime && l.seatNumber == seatNum);
                        const statusLabel = getMemberStatus(m, isStaff ? 'staff' : 'student');
                        const isUpcoming = statusLabel === 'Upcoming';
                        return (
                           <div key={seatNum} className={`aspect-square rounded-xl p-2 flex flex-col items-center justify-center text-center border-2 transition-all ${isCheckedIn ? 'bg-[#c9db93] border-[#4a5d23] dark:bg-[#4a5d23]/40 dark:border-[#a3b86c]' : isStaff ? 'bg-purple-200 border-purple-300 dark:bg-purple-900/40 dark:border-purple-800' : isUpcoming ? 'bg-blue-200 border-blue-300' : 'bg-amber-200 border-amber-300'}`}>
                              <span className={`text-lg font-bold mb-1 ${isCheckedIn ? 'text-white drop-shadow-md' : isStaff ? 'text-purple-700' : 'text-stone-700'}`}>{seatNum}</span>
                              <span className={`text-[10px] font-bold leading-tight line-clamp-1 ${isCheckedIn ? 'text-white drop-shadow-md' : 'text-stone-800 dark:text-stone-200'}`}>{m.name}</span>
                              {isStaff ? (
                                 <span className="text-[9px] font-bold text-purple-700 uppercase tracking-wide mt-0.5">Staff</span>
                              ) : (
                                 <span className={`text-[9px] mt-0.5 ${isCheckedIn ? 'text-white' : 'text-stone-600 dark:text-stone-400'}`}>{isUpcoming ? `Starts ${formatDateShort(m.membershipStart)}` : (m.type === 'Single Day' && m.duration ? m.duration : m.type)}</span>
                              )}
                           </div>
                        );
                     }
                     if (seatOwners.type === 'split') {
                        const { morning, afternoon } = seatOwners;
                        const now = new Date();
                        const isMorning = now.getHours() < 14;
                        const isMorningCheckedIn = morning && todaysLogs.some(l => !l.checkOutTime && l.seatNumber == seatNum && l.memberName === morning.name);
                        const isAfternoonCheckedIn = afternoon && todaysLogs.some(l => !l.checkOutTime && l.seatNumber == seatNum && l.memberName === afternoon.name);
                        return (
                           <div key={seatNum} className="aspect-square rounded-xl flex flex-col border-2 border-stone-300 dark:border-stone-700 overflow-hidden relative bg-white dark:bg-stone-900">
                              <div className={`flex-1 flex flex-col justify-center items-center px-1 py-0.5 ${isMorningCheckedIn ? 'bg-[#c9db93]' : (isMorning ? 'bg-white dark:bg-stone-800' : 'bg-stone-100 dark:bg-stone-900 opacity-100')}`}>
                                 {morning ? (<><div className="flex items-center justify-center gap-1 w-full"><span className="text-[8px] font-bold text-stone-500 uppercase tracking-tighter shrink-0">AM</span><span className={`text-[11px] font-bold truncate ${isMorningCheckedIn ? 'text-white drop-shadow-sm' : 'text-stone-700 dark:text-stone-200'}`}>{morning.name}</span></div>{getMemberStatus(morning, 'student') === 'Upcoming' && <span className="text-[8px] text-blue-500 font-medium leading-none mt-0.5">{formatDateShort(morning.membershipStart)}</span>}</>) : <span className="text-[9px] font-medium text-stone-400 uppercase tracking-wide">Empty</span>}
                              </div>
                              <div className="h-px bg-stone-300 dark:bg-stone-700 w-full relative z-10">
                                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-200 dark:bg-yellow-900/40 px-1.5 py-px rounded-full border border-yellow-300 dark:border-yellow-700 text-[9px] text-yellow-800 dark:text-yellow-200 font-extrabold shadow-sm select-none">{seatNum}</div>
                              </div>
                              <div className={`flex-1 flex flex-col justify-center items-center px-1 py-0.5 ${isAfternoonCheckedIn ? 'bg-[#c9db93]' : (!isMorning ? 'bg-white dark:bg-stone-800' : 'bg-stone-100 dark:bg-stone-900 opacity-100')}`}>
                                 {afternoon ? (<><div className="flex items-center justify-center gap-1 w-full"><span className="text-[8px] font-bold text-stone-500 uppercase tracking-tighter shrink-0">PM</span><span className={`text-[11px] font-bold truncate ${isAfternoonCheckedIn ? 'text-white drop-shadow-sm' : 'text-stone-700 dark:text-stone-200'}`}>{afternoon.name}</span></div>{getMemberStatus(afternoon, 'student') === 'Upcoming' && <span className="text-[8px] text-blue-500 font-medium leading-none mt-0.5">{formatDateShort(afternoon.membershipStart)}</span>}</>) : <span className="text-[9px] font-medium text-stone-400 uppercase tracking-wide">Empty</span>}
                              </div>
                           </div>
                        );
                     }
                     return null;
                  })}
               </div>
            </div>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4 text-stone-500"><KeyRound size={32} /></div>
              <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-1">Admin Access</h3>
              <input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} maxLength={4} className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3 border-2 border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-xl outline-none focus:border-stone-800 mb-6" placeholder="••••" autoFocus/>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => { setShowPinModal(false); setPinInput(''); }} className="py-3 font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors">Cancel</button>
                <button type="button" onClick={verifyPin} className="py-3 font-bold text-white bg-stone-800 hover:bg-stone-900 rounded-xl shadow-lg transition-transform active:scale-95">Unlock</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 text-center">
                 <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-2">{confirmModal.action}</h3>
                 <p className="text-stone-500 dark:text-stone-400 mb-4">{confirmModal.person.name}</p>
                 {confirmModal.seatNumber && <div className="mb-4 inline-block bg-[#eef2e2] dark:bg-[#4a5d23]/30 text-[#4a5d23] dark:text-[#a3b86c] px-3 py-1 rounded-full font-bold text-sm">Assigned Seat: {confirmModal.seatNumber}</div>}
                 <div className="mb-4 flex flex-col items-center justify-center">
                    {!useManualTime ? (
                       <button onClick={() => setUseManualTime(true)} className="text-xs font-bold text-blue-500 hover:text-blue-700 underline">Change Time?</button>
                    ) : (
                       <div className="bg-stone-100 dark:bg-stone-800 p-2 rounded-lg border border-stone-200 dark:border-stone-700 animate-in fade-in"><label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Set {confirmModal.action} Time</label><input type="time" value={manualTime} onChange={(e) => setManualTime(e.target.value)} className="font-mono text-lg font-bold bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded px-2 py-1 text-stone-800 dark:text-white text-center"/></div>
                    )}
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setConfirmModal(null)} disabled={isSubmitting} className="py-3 font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl disabled:opacity-50">Cancel</button>
                    <button type="button" onClick={executeAttendanceAction} disabled={isSubmitting} className="py-3 font-bold text-white bg-[#4a5d23] hover:bg-[#3b4a1c] rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">{isSubmitting && <Loader2 size={16} className="animate-spin" />} Confirm</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 text-center">
                 <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4 text-red-500"><Trash2 size={32} /></div>
                 <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-2">Delete Member?</h3>
                 <p className="text-stone-500 dark:text-stone-400 mb-6">Are you sure you want to delete <strong>{deleteModal.name}</strong>? This action cannot be undone.</p>
                 <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setDeleteModal(null)} className="py-3 font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors">Cancel</button>
                    <button type="button" onClick={executeDeletePerson} className="py-3 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg transition-colors">Delete</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {editLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-800/50">
               <h3 className="font-bold text-stone-800 dark:text-white">Edit Record</h3>
               <button onClick={() => setEditLogModal(null)} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
             </div>
             {(editLogModal.originalCheckInTime || editLogModal.originalCheckOutTime) && (
               <div className="bg-amber-50 dark:bg-amber-900/20 p-4 border-b border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
                 <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
                 <div><div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase mb-1">Original Record</div><div className="text-sm text-amber-800 dark:text-amber-300 font-mono">In: {editLogModal.originalCheckInTime ? formatTime(editLogModal.originalCheckInTime) : 'N/A'}<br/>Out: {editLogModal.originalCheckOutTime ? formatTime(editLogModal.originalCheckOutTime) : 'Pending'}</div></div>
               </div>
             )}
             <div className="p-6 space-y-4">
               <div><div className="text-sm font-bold text-stone-800 dark:text-white mb-1">{editLogModal.memberName}</div><div className="text-xs text-stone-500 dark:text-stone-400">{formatDateStringHeader(editLogModal.dateString)}</div></div>
               <div><label className="block text-xs font-bold text-stone-500 uppercase mb-1">Check In Time</label><input type="time" value={editLogModal.editCheckIn !== undefined ? editLogModal.editCheckIn : getTimeStringFromTimestamp(editLogModal.checkInTime)} onChange={(e) => setEditLogModal({...editLogModal, editCheckIn: e.target.value})} className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg p-3 font-mono text-lg"/></div>
               <div><label className="block text-xs font-bold text-stone-500 uppercase mb-1">Check Out Time</label><input type="time" value={editLogModal.editCheckOut !== undefined ? editLogModal.editCheckOut : getTimeStringFromTimestamp(editLogModal.checkOutTime)} onChange={(e) => setEditLogModal({...editLogModal, editCheckOut: e.target.value})} className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg p-3 font-mono text-lg"/><div className="text-[10px] text-stone-400 mt-1">Clear check out time to reopen session</div></div>
             </div>
             <div className="p-4 bg-stone-50 dark:bg-stone-800/50 flex justify-end"><button onClick={saveLogEdit} className="bg-[#4a5d23] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#3b4a1c] flex items-center gap-2"><Save size={16} /> Save Changes</button></div>
           </div>
        </div>
      )}

      {editMemberModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
             <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-800/50">
               <h3 className="font-bold text-stone-800 dark:text-white">{editMemberModal.mode === 'restore' ? 'Restore Member' : editMemberModal.mode === 'history' ? 'History' : editMemberModal.mode === 'renew' ? 'Renew Membership' : 'Edit Member'}</h3>
               <button type="button" onClick={() => setEditMemberModal(null)} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
             </div>
             <div className="p-6 space-y-4 overflow-y-auto">
               <div className="grid grid-cols-2 gap-3">
                 <div className={(editMemberModal.category === 'student' && editMemberModal.editType === 'Single Day') ? "col-span-2" : "col-span-1"}>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Name</label>
                    <input type="text" value={editMemberModal.editName} onChange={(e) => setEditMemberModal({...editMemberModal, editName: e.target.value})} className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg p-2 text-sm" disabled={editMemberModal.mode === 'history'}/>
                 </div>
                 {(editMemberModal.category !== 'student' || editMemberModal.editType !== 'Single Day') && (
                    <div><label className="block text-xs font-bold text-stone-500 uppercase mb-1">Birthday</label><input type="date" value={editMemberModal.editDob || ''} onChange={(e) => setEditMemberModal({...editMemberModal, editDob: e.target.value})} className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg p-2 text-sm" disabled={editMemberModal.mode === 'history'}/></div>
                 )}
               </div>
               <div><label className="block text-xs font-bold text-stone-500 uppercase mb-1">Notes (Staff Only)</label><textarea value={editMemberModal.editNotes} onChange={(e) => setEditMemberModal({...editMemberModal, editNotes: e.target.value})} className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg p-2 text-sm h-20 resize-none" placeholder="Exam prep details, preferences, etc." disabled={editMemberModal.mode === 'history'}/></div>
               {editMemberModal.mode !== 'history' && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                     <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${editMemberModal.editIsBlocked ? 'bg-red-500' : 'bg-stone-300'}`} onClick={() => setEditMemberModal({...editMemberModal, editIsBlocked: !editMemberModal.editIsBlocked})}><div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${editMemberModal.editIsBlocked ? 'translate-x-4' : ''}`}></div></div>
                     <span className="text-sm font-bold text-red-700 dark:text-red-400">Block from Check-in</span>
                  </div>
               )}
               {editMemberModal.mode !== 'history' && editMemberModal.category === 'student' && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                     <div className="text-xs font-bold text-indigo-500 uppercase mb-2 flex items-center gap-1"><CreditCard size={12} /> Payment Info (Optional)</div>
                     <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="Amount" value={editMemberModal.paymentAmount} onChange={(e) => setEditMemberModal({...editMemberModal, paymentAmount: e.target.value})} className="w-full border border-indigo-200 dark:border-indigo-800 dark:bg-stone-800 dark:text-white rounded-lg p-2 text-sm"/>
                        <select value={editMemberModal.paymentMethod} onChange={(e) => setEditMemberModal({...editMemberModal, paymentMethod: e.target.value})} className="w-full border border-indigo-200 dark:border-indigo-800 dark:bg-stone-800 dark:text-white rounded-lg p-2 text-sm"><option>Cash</option><option>UPI</option><option>Card</option></select>
                     </div>
                  </div>
               )}
               
               {(editMemberModal.category === 'student' || editMemberModal.category === 'staff') && (
                  <div className="mt-4">
                     {editMemberModal.category === 'student' && (
                         <div className="grid grid-cols-3 gap-2 mb-4">
                           {['Full Day', 'Morning Shift', 'Afternoon Shift', 'Single Day', 'Weekly'].map(type => (<button key={type} type="button" onClick={() => editMemberModal.mode !== 'history' && setEditMemberModal({...editMemberModal, editType: type})} disabled={editMemberModal.mode === 'history'} className={`px-2 py-1.5 rounded-lg border text-xs font-bold transition-all ${editMemberModal.editType === type ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}>{type}</button>))}
                         </div>
                     )}
                     <div className="mb-4">
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Assigned Seat (Permanent)</label>
                        <select value={editMemberModal.editAssignedSeat || ''} onChange={(e) => setEditMemberModal({...editMemberModal, editAssignedSeat: e.target.value})} className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg p-2 text-sm" disabled={editMemberModal.mode === 'history'}>
                          <option value="">No Assigned Seat</option>
                          {[...Array(TOTAL_SEATS)].map((_, i) => {
                             const seatNum = i + 1;
                             const checkType = editMemberModal.category === 'staff' ? 'Staff' : editMemberModal.editType;
                             const { available, reason } = getSeatStatus(seatNum, checkType, editMemberModal.id);
                             return (<option key={seatNum} value={seatNum} disabled={!available} className={!available ? "text-gray-400 bg-gray-100" : ""}>Seat {seatNum} {!available ? `(${reason})` : ''}</option>);
                          })}
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                       <div><label className="block text-xs font-bold text-stone-500 uppercase mb-1">{editMemberModal.category === 'staff' ? 'Date of Joining' : 'Start Date'}</label><input type="date" value={editMemberModal.editStartDate || ''} onChange={(e) => setEditMemberModal({...editMemberModal, editStartDate: e.target.value})} className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg p-2 text-sm" disabled={editMemberModal.mode === 'history'}/></div>
                       <div><label className="block text-xs font-bold text-stone-500 uppercase mb-1">{editMemberModal.category === 'staff' ? 'Date of Leaving' : 'End Date'}</label><input type="date" value={editMemberModal.editEndDate || ''} onChange={(e) => setEditMemberModal({...editMemberModal, editEndDate: e.target.value})} className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-lg p-2 text-sm" disabled={editMemberModal.mode === 'history'}/></div>
                     </div>
                  </div>
               )}
               
               {editMemberModal.seatHistory && editMemberModal.seatHistory.length > 0 && (
                  <div className="mt-6 border-t border-stone-100 dark:border-stone-800 pt-4">
                      <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-3 flex items-center gap-2"><MapPin size={14} /> Previous Seats</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                          {[...editMemberModal.seatHistory].sort((a, b) => (b.leftAt?.seconds || 0) - (a.leftAt?.seconds || 0)).map((hist, i) => (
                              <div key={i} className="bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 flex justify-between items-center text-xs">
                                  <span className="font-bold text-stone-700 dark:text-stone-300">Seat {hist.seat}</span>
                                  <span className="text-stone-400 font-mono">Removed: {formatDateShort(hist.leftAt)}</span>
                              </div>
                          ))}
                      </div>
                  </div>
               )}

               {editMemberModal.editHistory && editMemberModal.editHistory.length > 0 && (
                  <div className="mt-6 border-t border-stone-100 dark:border-stone-800 pt-4">
                      <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-3 flex items-center gap-2"><History size={14} /> Membership History</h4>
                      <div className="space-y-2">{[...editMemberModal.editHistory].sort((a, b) => (b.end?.seconds || 0) - (a.end?.seconds || 0)).map((hist, i) => (<div key={i} className="bg-stone-50 dark:bg-stone-800/50 p-3 rounded-lg border border-stone-200 dark:border-stone-700 flex justify-between items-center"><div><div className="font-bold text-stone-700 dark:text-stone-300 text-sm">{hist.type}</div><div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1"><Calendar size={10} />{formatDateShort(hist.start)} - {formatDateShort(hist.end)}</div></div><div className="text-[10px] font-mono text-stone-400 bg-white dark:bg-stone-900 px-2 py-1 rounded border border-stone-200 dark:border-stone-700">Archived: {formatDateShort(hist.archivedAt)}</div></div>))}</div>
                  </div>
               )}
               {editMemberModal.paymentHistory && editMemberModal.paymentHistory.length > 0 && (
                  <div className="mt-6 border-t border-stone-100 dark:border-stone-800 pt-4">
                      <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-3 flex items-center gap-2"><CreditCard size={14} /> Payment History</h4>
                      <div className="space-y-2">{[...editMemberModal.paymentHistory].sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)).map((pay, i) => (<div key={i} className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center"><div><div className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">{pay.type || 'Payment'}</div><div className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5 font-mono">{formatDateShort(pay.date)}</div></div><div className="text-right"><div className="font-bold text-indigo-800 dark:text-indigo-200">₹{pay.amount}</div><div className="text-[10px] text-indigo-400 uppercase">{pay.method}</div></div></div>))}</div>
                  </div>
               )}
             </div>
             <div className="p-4 bg-stone-50 dark:bg-stone-800/50 flex justify-end">
                {editMemberModal.mode === 'history' ? (
                  <button type="button" onClick={() => setEditMemberModal(null)} className="px-6 py-2 rounded-lg font-bold text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700">Close</button>
                ) : (
                  <button type="button" onClick={saveMemberUpdate} className="bg-[#4a5d23] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#3b4a1c] flex items-center gap-2"><Save size={16} /> Save</button>
                )}
             </div>
           </div>
        </div>
      )}

      {welcomeScreen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="relative bg-white dark:bg-stone-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-stone-200 dark:border-stone-700">
            <div className={`absolute top-0 left-0 w-full h-32 ${welcomeScreen.type === 'check-in' ? 'bg-gradient-to-b from-[#eef2e2] to-transparent' : 'bg-gradient-to-b from-amber-100 to-transparent'} opacity-50`}></div>
            <div className="relative z-10 mt-4">
                <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ring-4 ring-white dark:ring-stone-800 ${welcomeScreen.type === 'check-in' ? 'bg-[#eef2e2] text-[#4a5d23]' : 'bg-amber-100 text-amber-600'}`}>{welcomeScreen.type === 'check-in' ? <Hand size={48} className="animate-pulse" /> : <Smile size={48} className="animate-bounce" />}</div>
                <h2 className="text-2xl font-extrabold text-stone-800 dark:text-white mb-2 tracking-tight leading-tight">{welcomeScreen.type === 'check-in' ? 'Welcome to SYKiA! 🌿' : 'Have a Wonderful Day! ☀️'}</h2>
                <p className="text-xl font-medium text-stone-600 dark:text-stone-300 mb-8">{welcomeScreen.name}</p>
                <div className={`inline-flex items-center justify-center px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${welcomeScreen.type === 'check-in' ? 'bg-[#eef2e2] text-[#4a5d23]' : 'bg-amber-100 text-amber-700'}`}>{welcomeScreen.type === 'check-in' ? 'Checked In Successfully' : 'Checked Out Successfully'}</div>
            </div>
          </div>
        </div>
      )}

      {feedback && (<div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[200]"><div className={`px-6 py-3 rounded-full shadow-xl font-bold text-sm flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in ${feedback.type === 'success' ? 'bg-stone-800 text-white' : 'bg-red-500 text-white'}`}>{feedback.message}</div></div>)}
    </div>
  );
}