echo 'source /usr/share/bash-completion/completions/git' >> ~/.bashrc

cd /usr/share/bash-completion/completions
curl -O https://raw.githubusercontent.com/git/git/master/contrib/completion/git-prompt.sh
curl -O https://raw.githubusercontent.com/git/git/master/contrib/completion/git-completion.bash
chmod a+x git*.*
ls -l $PWD/git*.* | awk '{print "source "$9}' >> ~/.bashrc

echo 'GIT_PS1_SHOWDIRTYSTATE=true' >> ~/.bashrc
echo 'GIT_PS1_SHOWUNTRACKEDFILES=true' >> ~/.bashrc
echo 'GIT_PS1_SHOWUPSTREAM=true' >> ~/.bashrc

# For Git SSH
cp /mnt/hostosuser_homedir/.ssh/id_rsa /root/.ssh/

echo 'alias gti=git' >> ~/.bashrc

cd ~
