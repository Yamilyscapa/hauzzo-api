import { Router } from 'express';
import { Request, Response } from "express";
import { pool } from '../database/client'
import { createProperty } from '../controllers/propertyController';
const router = Router()
// Types
import { Property } from '../types/global'

// GET
router.get('/all', async (req: Request, res: Response): Promise<any> => {
    const { rows } = await pool.query('SELECT * FROM properties')

    return rows
})

router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    const id: string = req.params.id
    if (!id) return;

    await pool.query('SELECT * FROM properties WHERE id = $1', [id])
})

// POST
router.get('/create', async (req: Request, res: Response): Promise<any> => {
    const body = req.body
    createProperty(<Property>body)
})

// EDIT

// DELETE

export default router