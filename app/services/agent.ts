import { user_placeholder } from '@/utils/constants';
import { isManager } from '@/utils/isManager';

export class Agent {
  id: string;
  name: string;
  email: string;
  avatar: any;
  avatar2: any;
  brochureAvatar: any;
  team: any[];
  photoUrl: string;
  isManager: boolean;

  constructor(user: Agent) {
    this.id = user?.id;
    this.name = user?.name;
    this.email = user?.email;
    this.avatar = user?.avatar;
    this.team = user?.team;
    this.photoUrl = user?.photoUrl;
    this.brochureAvatar = user?.brochureAvatar;
    this.isManager = isManager(user);
  }

  get user_avatar() {
    return (
      this.photoUrl ||
      this.avatar?.file ||
      this.avatar2?.file ||
      this.brochureAvatar?.file ||
      user_placeholder
    );
  }
}
