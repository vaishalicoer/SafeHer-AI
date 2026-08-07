const EmergencyContact = require("../models/EmergencyContact");
const User = require("../models/User");

// ================= ADD CONTACT =================

exports.addContact = async (req, res) => {

    try {

        const { name, phone, relation } = req.body;

        const contact = await EmergencyContact.create({

            user: req.user._id,

            name,

            phone,

            relation,

        });

        await User.findByIdAndUpdate(req.user._id, {

            $push: {

                emergencyContacts: contact._id,

            }

        });

        res.status(201).json({

            success: true,

            contact,

        });

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:"Server Error"

        })

    }

};

// ================= GET CONTACTS =================

exports.getContacts = async (req,res)=>{

    try{

        const contacts = await EmergencyContact.find({

            user:req.user._id

        });

        res.json({

            success:true,

            contacts

        });

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }

};

// ================= UPDATE =================

exports.updateContact = async(req,res)=>{

    try{

        const contact = await EmergencyContact.findOneAndUpdate(

            {

                _id:req.params.id,

                user:req.user._id

            },

            req.body,

            {

                new:true

            }

        );

        if(!contact){

            return res.status(404).json({

                success:false,

                message:"Contact not found"

            });

        }

        res.json({

            success:true,

            contact

        });

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }

};

// ================= DELETE =================

exports.deleteContact = async(req,res)=>{

    try{

        const contact = await EmergencyContact.findOne({

            _id:req.params.id,

            user:req.user._id

        });

        if(!contact){

            return res.status(404).json({

                success:false,

                message:"Contact not found"

            });

        }

        await contact.deleteOne();

        await User.findByIdAndUpdate(req.user._id,{

            $pull:{

                emergencyContacts:contact._id

            }

        });

        res.json({

            success:true,

            message:"Contact Deleted"

        });

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }

};