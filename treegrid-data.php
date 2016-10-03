<?php
header('Content-type: application/json');

if ($_REQUEST['node'] == '-1') {
    ?>

    [
    {
    text:'Age: 45-64 - HHI: 75k+',
    id:'seg1',
    status: 'Published',
    sections: 3,
    size: '1111',
    leaf: false
    },

    {
    text:'25-44, No-kids, 60k',
    id:'seg2',
    status: 'In-Flight',
             size: '2222',
        sections: 3,
    leaf: false

    },

    {
    text:'25-44, Plan for cruise',
    id:'seg3',
    status: 'Unpublished',
             size: '3333',
        sections: 3,
    leaf: false

    }
    ,

    {
    text:'Credit Card In Market',
    id:'seg4',
    status: 'Unpublished',
             size: '4444',
        sections: 3,
    leaf: false

    }
    ]
    <?
}

if (in_array($_REQUEST['node'] , array('seg1' , 'seg2', 'seg3', 'seg4') )) {
    ?>

    [
    {
    text:'Section 1 ',
    id:'sec<?=uniqid()?>',
    size: '1235435546',
    leaf: false
    },

    {
    text:'Section 2 ',
    id:'sec<?=uniqid()?>',
    size: '43254456435',
    leaf: false

    },

    {
    text:'Section 3',
    id:'sec<?=uniqid()?>',
    size: '432434223',
    leaf: false

    }
    ]
    <?
}
if (strpos($_REQUEST['node'], 'sec') === 0) {
    ?>
    [
    {
    text:'Subsection 1',
    id:'sub1',
    size: '2135',
    leaf: false
    },

    {
    text:'Subsection 2',
    id:'sub2',
    size: '112355',
    leaf: false

    },

    {
    text:'Subsection 3',
    id:'sub3',
    size: '112355',
    leaf: false

    }
    ]


    <?
}


if ($_REQUEST['node'] == 'sub1') {
    ?>
    [
    {
    text:'31-35',
    id:'cat1',
    datasource:'Datalogix',
    size: '2135',
    leaf: true
    },

    {
    text:'35-39 ',
    id:'cat2',
    datasource:'Datalogix',
    size: '112355',
    leaf: true

    },

    {
    text:'40-47',
    id:'cat3',
    datasource:'Datalogix',
    size: '112355',
    leaf: true

    }
    ]


    <?
}
if ($_REQUEST['node'] == 'sub2') {
    ?>
    [
    {
    text:'25-44, No-kids, 60k',
    id:'cat4',
    datasource:'Red aril',
    size: '11277',
    leaf: true
    },

    {
    text:'Business Magazines',
    id:'cat5',
    datasource:'Rapleaf',
    size: '8764321',
    leaf: true

    },

    {
    text:'Album Art',
    datasource:'3rd party',
    id:'cat6',
    size: '112355',
    leaf: true

    }
    ]

    <?
}
if ($_REQUEST['node'] == 'sub3') {
    ?>
    [
    {
    text:'Photoart',
    id:'cat7',
    datasource:'Bizo',
    size: '31567',
    leaf: true
    },

    {
    text:'Books',
    id:'cat8',
    datasource:'Rapleaf',
    size: '17684444',
    leaf: true

    },

    {
    text:'USA',
    id:'cat9',
    datasource:'BlueKai',
    size: '17900000',
    leaf: true

    }
    ]

    <?
}
?>

