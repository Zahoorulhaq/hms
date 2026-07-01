import Loader from '@/components/Loader';
import { flatten, get, isEmpty, map } from 'lodash';
import { useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import { log } from 'node:console';
import { me } from '@/server/apis/auth';
export interface UserContextType {
  data: any;
  isSuper: boolean;
  setUserData: (data: Partial<UserContextType>) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isRoot, setIsRoot] = useState<boolean>(false);
  const [branch, setBranch] = useState<any>(null);
  const [isSuper, setIsSuper] = useState<boolean>(false);
  const [preventClose, setPreventClose] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef(false);

  const setUserData = (data: any) => {
    setData(data.data);
    setIsSuper(data.isSuper);
  };
  const setClosePrevention = (data: boolean) => {
    setPreventClose(data);
  };

  useEffect(() => {
    if (!ref.current) {
      getProfile();
      ref.current = true;
    }
  }, []);

  const getProfile = async () => {
    if (!session?.user?.token || !session) {
      setIsLoading(false);
      return;
    } else {
      setIsLoading(true);
      try {
        const response = await me();
        if (response) {
          setData(response);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
    // setIsLoading(true);
   
  };
  if (isLoading) return <Loader />;

  return (
    <UserContext.Provider
      value={{
        isSuper,
        setUserData,
        isLoading,
        data,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType | null => {
  const context = useContext(UserContext);
  if (context?.isLoading) return null;
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
