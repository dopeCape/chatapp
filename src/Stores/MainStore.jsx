import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
function theFunc(x, w) {
  x.chatWorkSpaces.workspaces.push(w);
  console.log(x);
  return x;
}

const useUserStore = create(
  devtools((set, get) => ({
    user: null,
    updateUserState: user => {
      set(() => ({
        user: user
      }));
    },
    addWorkSpace: w => {
      set(state => ({
        user: {
          ...state.user,
          chatWorkSpaces: {
            ...state.user.chatWorkSpaces,
            workspaces: [...state.user.chatWorkSpaces.workspaces, w]
          }
        }

        // return { user: x };
      }));
    },
    addUser: (user, id) => {
      let x = get().user;
      x.chatWorkSpaces.workspaces = x.chatWorkSpaces.workspaces.map(x => {
        if (x.id == id) {
          x.chatWorkSpace.push(user);
        }

        return x;
      });

      set(state => ({
        user: x
      }));
    }
  })),
  { store: 'userStore' }
);

const useMsgesStore = create(
  devtools(
    (set, get) => ({
      msges: new Map(),
      updateMsgesState: msge => {
        let _ = get().msges;

        _.set(msge.chatId, msge);

        set({ msges: _ });
      },
      changeMsgesState: msge => {
        set({ msges: msge });
      }
    }),
    { store: 'msgstore' }
  )
);
// const useUserStore = create(useUser);
const useSelectedStore = create(
  devtools(
    (set, get) => ({
      user: null,
      updateSelectedState: user => set({ user: user })
    }),
    { store: 'selected store' }
  )
);
const useWorkSpaceStore = create(
  devtools(set => ({
    workspace: null,
    setWorkSelectdSapce: workspace => set({ workspace: workspace })
  }))
);
const useChatStore = create(
  devtools((set, get) => ({
    chats: [],
    setChat: chats => {
      set({ chats: chats });
    },
    addChat: w => {
      set(state => ({
        chats: [w, ...state.chats]
      }));
    },
    setTyping: (w, i) => {
      let chats = get().chats;
      chats = chats.map(x => {
        if (x.chatId === w) {
          x.chat.typing = i;
        }
        return x;
      });

      set(() => ({
        chats: chats
      }));
    },
    addMsg: w => {
      let chats = get().chats;

      chats = chats.map(x => {
        if (x.chatId === w.chatId) {
          x.chat.msges.push(w);
        }
        return x;
      });
      chats.sort((a, b) => {
        const aLM = a.chat.msges[a.chat.msges.length - 1];
        const bLM = b.chat.msges[b.chat.msges.length - 1];
        return new Date(bLM.createdAt) - new Date(aLM.createdAt);
      });
      set(state => ({
        chats: chats
      }));
    },
    deleteMsg: (w, i) => {
      let chats = get().chats;

      chats = chats.map(x => {
        if (x.chatId === i) {
          x.chat.msges = x.chat.msges.filter(y => {
            return y.id !== w;
          });
        }

        return x;
      });
      set(() => ({
        chats: chats
      }));
    },
    editMsg: (w, i, msg) => {
      let chats = get().chats;

      chats = chats.map(x => {
        if (x.chatId === i) {
          x.chat.msges = x.chat.msges.map(y => {
            if (y.id === w) {
              y.content = msg;
            }
            return y;
          });
        }

        return x;
      });
      set(() => ({
        chats: chats
      }));
    },

    incrementUnRead: w => {
      let friends = get().chats;
      friends.forEach(fr => {
        if (fr.id === w) {
          fr.unRead = fr.unRead + 1;
        }
      });
      set(() => ({
        chats: friends
      }));
    },
    setUnReadToZero: w => {
      let friends = get().chats;
      friends.forEach(fr => {
        if (fr.id === w) {
          fr.unRead = 0;
        }
      });
      set(() => ({
        chats: friends
      }));
    }
  }))
);
const useGroupChatStore = create(
  devtools((set, get) => ({
    chats: [],
    setChat: chats => {
      set({ chats: chats });
    },
    addChat: w => {
      let chats = [w, ...get().chats];
      set(state => ({
        chats: chats

        // return { user: x };
      }));
    },
    updateChat: (w, i) => {
      let chats = get().chats;
      chats.forEach((x, j) => {
        if (x.id === i) {
          x.msges.push(w);
          var element = chats[j];
          chats.splice(j, 1);
          chats.splice(0, 0, element);
        }
        return x;
      });

      set(state => ({
        chats: state.chats.map((x, i) => {
          if (x.id === i) {
            x.msges.push(w);
          }
          return x;
        })
      }));
    },
    removeuser: (w, i, msg) => {
      let x = get().chats;
      x.forEach(y => {
        if (y.id === w) {
          y.user = y.user.filter(z => {
            return z.id !== i;
          });
        }
      });

      set(state => ({
        chats: x
      }));
    },
    removegroup: groupId => {
      let x = get().chats;
      x = x.filter(y => {
        return y.id !== groupId;
      });
      set(state => ({
        chats: x
      }));
    },
    addUser: (w, i) => {
      set(state => ({
        chats: state.chats.map(x => {
          if (x.id === i) {
            x.user.push(w);
          }
          return x;
        })
      }));
    },
    editMsg: (w, i, msg) => {
      let chats = get().chats;
      chats = chats.map(x => {
        if (x.id === i) {
          x.msges = x.msges.map(y => {
            if (y.id === w) {
              y.content = msg;
            }
            return y;
          });
        }

        return x;
      });
      set(() => ({
        chats: chats
      }));
    },
    deleteMsg: (w, i) => {
      let chats = get().chats;

      chats = chats.map(x => {
        if (x.id === i) {
          x.msges = x.msges.filter(y => {
            return y.id !== w;
          });
        }

        return x;
      });
      set(() => ({
        chats: chats
      }));
    }
  }))
);
const useSelectedChatStore = create(
  devtools((set, get) => ({
    user: null,
    updateChatState: user => set({ user: user }),
    addNewUserToSelectedStore: w => {
      let sl = get().user;
      sl.user.push(w);
      set(() => ({
        user: sl
      }));
    }
  }))
);

export {
  useMsgesStore,
  useUserStore,
  useSelectedStore,
  useSelectedChatStore,
  useChatStore,
  useWorkSpaceStore,
  useGroupChatStore
};
