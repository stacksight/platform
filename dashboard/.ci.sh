#git clone https://gitlab.linnovate.net/root/qa_all.git

project_name=$( basename $PWD ) #$(cd `dirname $0`; pwd)
test -d qa_all || { git clone git@gitlab.linnovate.net:root/qa_all.git; }

cd qa_all
git pull

cmd="./.ci.sh $project_name"
echo 1>&2 cmd: $cmd
eval "$cmd"