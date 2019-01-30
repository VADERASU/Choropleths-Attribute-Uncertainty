# Exploring the Sensitivity of Choropleths under Attribute Uncertainty


## Getting Started

These code is for IEEE TVCG paper 'Exploring the Sensitivity of Choropleths under Attribute Uncertainty'

Node version: 10.10.0 (important)

Npm version: 6.4.1 (important)

## Installing
To develop with full live reload. use:
```
npm install
npm start 
```

Then open the Chrome at "localhost:8000".

## Case study
To obtain the results we presented in the paper, please follow Video.mp4. (Choropleths-Attribute-Uncertainty/Video.mp4)

### Interface

To arrive to the state shown at video 00:31 by using the top-right button ‘File’ to load the ‘Crime Data’ and clicking the ‘Cluster Parameters’ button.

To arrive to the state shown at video 00:59 by using the top-right button ‘File’ to load the ‘Election’ and clicking the ‘Cluster Parameters’ button. Then, the user should select ‘EDU635213’ and ‘EDU685213’, set the groups number as ‘5’, and click the ‘Run K-means’ button to run the clustering algorithm. The 'uncertainty_setting.csv' which is used at video 01:02 is in 'Choropleths-Attribute-Uncertainty/data/uncertainty_setting.csv'.

To arrive to the state shown at video 01:10 by using the top-right button ‘File’ to load the ‘Crime Data’ and clicking the ‘Cluster Parameters’ button. Then, the user should select ‘ROBBERY’, set the groups number as ‘6’, and click the ‘Run K-means’ button to run the clustering algorithm.

### Single Attribute Classification

To arrive to the state shown at video 01:27 by using the top-right button ‘File’ to load the ‘Crime Data’ and clicking the ‘Cluster Parameters’ button.

### Bivariate Classification

To arrive to the state shown at video 03:00 by using the top-right button ‘File’ to load the ‘Election’ and clicking the ‘Cluster Parameters’ button.

### Multivariate Classification

To arrive to the state shown at video 05:15 by using the top-right button ‘File’ to load the ‘Election’ and clicking the ‘Cluster Parameters’ button.
For this example, the analysis may take a few minutes to compute depending on your configuration.

##Data

The Crime data (CommAreasNew.zip, Ccrimeeventdata.txt) and the election data (tl_2017_us_county.zip, election.zip) are now available at https://github.com/VADERASU/Choropleths-Attribute-Uncertainty/tree/master/data.

We use the open sources dataset.

The Crime data are downloaded at:
[Chicago Data Portal](https://data.cityofchicago.org/Public-Safety/Crimes-2015/vwwp-7yr9) 

The Election data are downloaded at:
[USA Census Data](https://geodacenter.github.io/data-and-lab//county_election_2012_2016-variables/)
And [USA Shape File](http://www2.census.gov/geo/tiger/TIGER2017/COUNTY/)

## Ref
Zhaosong Huang, Yafeng Lu, Elizabeth A. Mack, Wei Chen, and Ross Maciejewski. "Exploring the Sensitivity of Choropleths under Attribute Uncertainty." IEEE Transactions on Visualization and Computer Graphics. (accepted)

## Contact Us
If have any problem when install or run the system, please contact us at zhaosong_huang@zju.edu.cn.
